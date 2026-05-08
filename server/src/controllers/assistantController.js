import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Conversation from '../models/Conversation.js';

const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Cache the last successful model name to reduce API calls
let lastWorkingModel = "gemini-2.5-flash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = new Conversation({ userId: req.user.userId, messages: [] });
    }

    // 1. Simple Web Search (Optional)
    let searchContext = "";
    if (/\?|how|what|who/i.test(message) && message.length > 8) {
      try {
        const ddgRes = await axios.get(`https://api.duckduckgo.com/`, {
          params: { q: message, format: 'json', no_html: 1, skip_disambig: 1 },
          timeout: 2500
        });
        if (ddgRes.data.AbstractText) searchContext += `\nContext: ${ddgRes.data.AbstractText}`;
      } catch (err) { /* Silent fail */ }
    }

    // 2. Build History
    const history = conversation.messages.slice(-6).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // 3. Smart Model Selection
    const modelsToTry = [lastWorkingModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro"].filter((v, i, a) => a.indexOf(v) === i);
    let assistantReply = "";
    let lastError = null;

    if (!genAI) {
      return res.status(500).json({ message: 'AI backend misconfigured: missing GEMINI_API_KEY' });
    }

    const systemMsg = "You are NexusDesk AI. Be extremely concise and bold key terms.";
    const userPrompt = searchContext ? `CONTEXT: ${searchContext}\n\nUSER: ${message}` : message;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Try with history first
        try {
          const result = await model.generateContent({
            contents: [...history, { role: 'user', parts: [{ text: `${systemMsg}\n\n${userPrompt}` }] }]
          });
          assistantReply = await result.response.text();
        } catch (e) {
          // Fallback to no-history for this model if history fails (fixes 400s)
          const result = await model.generateContent(`${systemMsg}\n\n${userPrompt}`);
          assistantReply = await result.response.text();
        }

        if (assistantReply) {
          lastWorkingModel = modelName; // Save successful model
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err.message);
        if (err.status === 429) {
          if (modelName !== modelsToTry[modelsToTry.length - 1]) {
            await sleep(1000);
            continue;
          }
          break;
        }
        continue;
      }
    }

    if (!assistantReply) throw lastError || new Error("AI Busy");

    // 4. Save and Respond
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });
    conversation.messages.push({ role: 'assistant', content: assistantReply, timestamp: new Date() });
    await conversation.save();

    res.status(201).json({ message: 'Sent', conversation });
  } catch (error) {
    console.error('AI Error:', error.message);
    const status = error.status || 500;
    res.status(status).json({ 
      message: status === 429 ? "Google is busy. Wait 30s!" : `AI Error: ${error.message}`
    });
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    res.json(conversation);
  } catch (e) { next(e); }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (e) { next(e); }
};

export const deleteConversation = async (req, res, next) => {
  try {
    await Conversation.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
};
