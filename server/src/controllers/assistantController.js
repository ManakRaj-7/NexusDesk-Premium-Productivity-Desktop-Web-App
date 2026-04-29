import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Conversation from '../models/Conversation.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = new Conversation({ user: req.user.userId, messages: [] });
    }

    // 1. Web Search Augmentation
    let searchContext = "";
    if (/\?|what|how|why|who|when/i.test(message) && message.length > 5) {
      try {
        const ddgRes = await axios.get(`https://api.duckduckgo.com/`, {
          params: { q: message, format: 'json', no_html: 1, skip_disambig: 1 },
          timeout: 3000
        });
        if (ddgRes.data.AbstractText) searchContext += `\nInfo: ${ddgRes.data.AbstractText}`;
        
        const wikiRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
          params: { action: 'query', list: 'search', srsearch: message, utf8: '', format: 'json', srlimit: 1 },
          timeout: 3000
        });
        if (wikiRes.data.query?.search?.[0]) {
          const pageRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
            params: { action: 'query', prop: 'extracts', exintro: true, explaintext: true, titles: wikiRes.data.query.search[0].title, format: 'json' },
            timeout: 3000
          });
          const pages = pageRes.data.query?.pages;
          const pageId = pages ? Object.keys(pages)[0] : null;
          if (pageId && pageId !== '-1') searchContext += `\nWikipedia: ${pages[pageId].extract.substring(0, 500)}`;
        }
      } catch (err) { console.error('Search tool skipped'); }
    }

    // 2. Build History
    const history = conversation.messages.slice(-8).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // 3. Robust Model Fallback System
    const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let assistantReply = "";
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const systemPrompt = "You are NexusDesk AI. Be extremely concise and bold key terms. Don't use filler.";
        const finalPrompt = searchContext ? `CONTEXT: ${searchContext}\n\nUSER: ${message}` : message;

        const chat = model.startChat({ 
          history,
          systemInstruction: systemPrompt 
        });
        
        const result = await chat.sendMessage(finalPrompt);
        assistantReply = result.response.text();
        if (assistantReply) break; 
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed/busy, trying next...`);
        if (err.status === 429 || err.status === 503) {
           // Wait a tiny bit if rate limited
           await new Promise(r => setTimeout(r, 500));
        }
        continue;
      }
    }

    if (!assistantReply) {
      throw lastError || new Error("All AI models are currently busy.");
    }

    // 4. Save and Respond
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });
    conversation.messages.push({ role: 'assistant', content: assistantReply, timestamp: new Date() });
    await conversation.save();

    res.status(201).json({ message: 'Sent', conversation });
  } catch (error) {
    console.error('Final Assistant Error:', error);
    const status = error.status || 500;
    const msg = status === 429 ? "Google's free tier is currently overloaded. Please wait 30 seconds and try again!" : "The AI is currently resetting. Please try again!";
    res.status(status).json({ message: msg });
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user.userId });
    res.json(conversation);
  } catch (e) { next(e); }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user.userId }).sort({ updatedAt: -1 }).limit(20);
    res.json(conversations);
  } catch (e) { next(e); }
};

export const deleteConversation = async (req, res, next) => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
};
