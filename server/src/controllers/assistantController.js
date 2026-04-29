import Conversation from '../models/Conversation.js';
import axios from 'axios';

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty', code: 'EMPTY_MESSAGE' });
    }

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: req.user.userId,
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' });
      }
    } else {
      // Create new conversation
      conversation = new Conversation({
        userId: req.user.userId,
        title: message.substring(0, 50),
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    const lowerMsg = message.toLowerCase().trim();
    const GREETINGS = ['hi', 'hello', 'hey', 'yo', 'sup', 'hi there', 'hello there'];
    let assistantReply = "";

    // 1. Handle Greetings
    if (GREETINGS.some(g => lowerMsg === g || lowerMsg.startsWith(g + ' ')) || lowerMsg.length < 3) {
      assistantReply = "Hey! I'm your NexusDesk AI. I'm connected to the web and can help you find info, manage your tasks, or just chat. What can I do for you today?";
    } else {
      // 2. Try DuckDuckGo for quick answers
      try {
        const ddgRes = await axios.get(`https://api.duckduckgo.com/`, {
          params: { q: message, format: 'json', no_html: 1, skip_disambig: 1 },
          timeout: 5000
        });
        
        if (ddgRes.data.AbstractText) {
          assistantReply = ddgRes.data.AbstractText;
        }
      } catch (ddgErr) {
        console.error('DuckDuckGo API error:', ddgErr.message);
      }

      // 3. Fallback to Wikipedia if no DDG answer
      if (!assistantReply) {
        try {
          const searchRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
            params: {
              action: 'query',
              list: 'search',
              srsearch: message,
              utf8: '',
              format: 'json',
            },
            headers: { 'User-Agent': 'NexusDesk/1.0 (nexus@example.com)' },
            timeout: 5000
          });
          
          const searchResults = searchRes.data.query?.search;
          if (searchResults && searchResults.length > 0) {
            const title = searchResults[0].title;
            const pageRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
              params: {
                action: 'query',
                prop: 'extracts',
                exintro: true,
                explaintext: true,
                titles: title,
                format: 'json',
              },
              headers: { 'User-Agent': 'NexusDesk/1.0 (nexus@example.com)' },
              timeout: 5000
            });
            
            const pages = pageRes.data.query?.pages;
            const pageId = pages ? Object.keys(pages)[0] : null;
            const extract = pageId && pageId !== '-1' ? pages[pageId].extract : null;
            
            if (extract) {
              assistantReply = `According to my research:\n\n${extract}`;
            }
          }
        } catch (wikiErr) {
          console.error('Wikipedia API error:', wikiErr.message);
        }
      }
    }

    if (!assistantReply) {
      assistantReply = "I'm sorry, I'm having a hard time finding a specific answer for that. Can you try asking in a different way?";
    }

    conversation.messages.push({
      role: 'assistant',
      content: assistantReply,
      timestamp: new Date(),
    });

    await conversation.save();

    res.status(201).json({
      message: 'Message sent',
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' });
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.userId }).sort({
      updatedAt: -1,
    });

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found', code: 'NOT_FOUND' });
    }

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    next(error);
  }
};
