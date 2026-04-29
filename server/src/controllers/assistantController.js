import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Conversation from '../models/Conversation.js';

// Initialize Gemini with the standard @google/generative-ai SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = new Conversation({
        user: req.user.userId,
        messages: [],
      });
    }

    // 1. Web Search Augmentation (Tools)
    let searchContext = "";
    const isQuestion = /\?|what|how|why|who|when|where/i.test(message);
    
    if (isQuestion && message.length > 5) {
      try {
        const ddgRes = await axios.get(`https://api.duckduckgo.com/`, {
          params: { q: message, format: 'json', no_html: 1, skip_disambig: 1 },
          timeout: 4000
        });
        if (ddgRes.data.AbstractText) {
          searchContext += `\nWeb Context: ${ddgRes.data.AbstractText}`;
        }
        
        const wikiRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
          params: { action: 'query', list: 'search', srsearch: message, utf8: '', format: 'json', srlimit: 1 },
          headers: { 'User-Agent': 'NexusDesk/2.0' },
          timeout: 4000
        });
        if (wikiRes.data.query?.search?.[0]) {
          const title = wikiRes.data.query.search[0].title;
          const pageRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
            params: { action: 'query', prop: 'extracts', exintro: true, explaintext: true, titles: title, format: 'json' },
            timeout: 4000
          });
          const pages = pageRes.data.query?.pages;
          const pageId = pages ? Object.keys(pages)[0] : null;
          if (pageId && pageId !== '-1') {
            searchContext += `\nWikipedia Info: ${pages[pageId].extract.substring(0, 600)}`;
          }
        }
      } catch (err) {
        console.error('Search tool error:', err.message);
      }
    }

    // 2. Build History (Memory)
    const history = conversation.messages.slice(-8).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // 3. Generate AI Response
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { maxOutputTokens: 500 }
    });

    const systemPrompt = "You are NexusDesk AI. Be helpful, concise, and direct. Use the provided search context if relevant. Always bold key terms. Don't use conversational filler like 'Sure' or 'I looked that up'.";
    
    const finalPrompt = searchContext 
      ? `SYSTEM: ${systemPrompt}\n\nCONTEXT FROM WEB:\n${searchContext}\n\nUSER QUESTION: ${message}`
      : `SYSTEM: ${systemPrompt}\n\nUSER QUESTION: ${message}`;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(finalPrompt);
    const response = await result.response;
    const assistantReply = response.text();

    // Save messages
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });
    conversation.messages.push({ role: 'assistant', content: assistantReply, timestamp: new Date() });
    await conversation.save();

    res.status(201).json({ message: 'Message sent', conversation });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ message: 'AI issue. Please ensure your API key is valid and restart server.' });
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user.userId });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation);
  } catch (error) { next(error); }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user.userId }).sort({ updatedAt: -1 }).limit(20);
    res.json(conversations);
  } catch (error) { next(error); }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
};
