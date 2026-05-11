import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Conversation from '../models/Conversation.js';

const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterClient = openRouterApiKey ? new OpenAI({ apiKey: openRouterApiKey, baseURL: "https://openrouter.ai/api/v1" }) : null;

// Cache the last successful model name to reduce API calls
let lastWorkingModel = configuredModel;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeModelName = (modelName) => modelName.replace(/^models\//, "").trim();

const getModelNamesToTry = () => {
  const supportedModels = [
    normalizeModelName(lastWorkingModel),
    normalizeModelName(configuredModel),
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ];

  return supportedModels.filter(Boolean).filter((model, index, models) => models.indexOf(model) === index);
};

const buildAssistantError = (errors) => {
  const rateLimitError = errors.find((error) => error?.status === 429);
  if (rateLimitError) {
    const error = new Error("Google AI Studio free tier is rate limited right now. Wait 30s and try again.");
    error.status = 429;
    return error;
  }

  const notFoundError = errors.find((error) => error?.status === 404);
  if (notFoundError) {
    const error = new Error("Gemini model unavailable. Set GEMINI_MODEL=gemini-2.5-flash-lite or gemini-2.5-flash in server/.env.");
    error.status = 502;
    return error;
  }

  return errors.at(-1) || new Error("AI Busy");
};

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

    
    // 2. Common Prep
    let assistantReply = "";
    const modelErrors = [];

    if (!genAI && !openRouterClient) {
      return res.status(500).json({ message: 'AI backend misconfigured: missing API keys' });
    }

    const systemMsg = "You are NexusDesk AI. Be extremely concise and bold key terms.";
    const userPrompt = searchContext ? `CONTEXT: ${searchContext}\n\nUSER: ${message}` : message;

    // 3. Try OpenRouter Free Models First
    if (openRouterClient) {
      const openRouterModels = [
        "deepseek/deepseek-chat-v3:free",
        "qwen/qwen3-coder:free",
        "meta-llama/llama-3.3-70b-instruct:free"
      ];

      const openRouterHistory = conversation.messages.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
      openRouterHistory.unshift({ role: 'system', content: systemMsg });
      openRouterHistory.push({ role: 'user', content: userPrompt });

      for (const modelName of openRouterModels) {
        try {
          console.log(`Trying OpenRouter model: ${modelName}`);
          const completion = await openRouterClient.chat.completions.create({
            model: modelName,
            messages: openRouterHistory,
          });
          assistantReply = completion.choices[0].message.content;
          if (assistantReply) {
            console.log(`OpenRouter model ${modelName} succeeded.`);
            break;
          }
        } catch (err) {
          modelErrors.push(err);
          console.warn(`OpenRouter Model ${modelName} failed:`, err.message);
          continue;
        }
      }
    }

    // 4. Fallback to Gemini
    if (!assistantReply && genAI) {
      console.log("Switching to Gemini Fallback...");
      const modelsToTry = getModelNamesToTry();
      
      const history = conversation.messages.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying Gemini model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          try {
            const result = await model.generateContent({
              contents: [...history, { role: 'user', parts: [{ text: `${systemMsg}\n\n${userPrompt}` }] }]
            });
            assistantReply = await result.response.text();
          } catch (e) {
            const result = await model.generateContent(`${systemMsg}\n\n${userPrompt}`);
            assistantReply = await result.response.text();
          }

          if (assistantReply) {
            console.log(`Gemini model ${modelName} succeeded.`);
            lastWorkingModel = modelName;
            break;
          }
        } catch (err) {
          modelErrors.push(err);
          console.warn(`Gemini Model ${modelName} failed:`, err.message);
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
    }

    if (!assistantReply) throw buildAssistantError(modelErrors);
// 4. Save and Respond
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });
    conversation.messages.push({ role: 'assistant', content: assistantReply, timestamp: new Date() });
    await conversation.save();

    res.status(201).json({ message: 'Sent', conversation });
  } catch (error) {
    console.error('AI Error:', error.message);
    const status = error.status || 500;
    res.status(status).json({ 
      message: error.message || "AI Error"
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
