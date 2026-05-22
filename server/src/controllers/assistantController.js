import axios from 'axios';
import Conversation from '../models/Conversation.js';
import { AI_MODEL_LABEL, generateAssistantReply } from '../services/aiProvider.js';

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

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
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

    // 2. Generate through OpenRouter with model fallbacks
    const systemMsg = "You are NexusDesk AI, a concise productivity assistant. Keep answers practical, brief, and easy to scan. Bold only the most important terms.";
    const userPrompt = searchContext ? `CONTEXT: ${searchContext}\n\nUSER: ${message}` : message;
    const aiResult = await generateAssistantReply({
      systemMessage: systemMsg,
      history: conversation.messages,
      userPrompt,
    });

    if (aiResult.fallbackActivated) {
      console.info(`AI fallback activated: ${aiResult.model}`);
    }

    // 3. Save and Respond
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });
    conversation.messages.push({ role: 'assistant', content: aiResult.content, timestamp: new Date() });
    await conversation.save();

    res.status(201).json({
      message: 'Sent',
      conversation,
      ai: {
        provider: aiResult.provider,
        model: aiResult.model,
        label: aiResult.fallbackActivated ? aiResult.model : AI_MODEL_LABEL,
        fallbackActivated: aiResult.fallbackActivated,
        attemptedModels: aiResult.attemptedModels,
      },
    });
  } catch (error) {
    console.error('AI Error:', error.message);
    const status = error.status || 500;
    res.status(status).json({ 
      message: error.message || "AI Error",
      code: error.code || 'AI_ERROR',
      attempts: error.attempts,
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
