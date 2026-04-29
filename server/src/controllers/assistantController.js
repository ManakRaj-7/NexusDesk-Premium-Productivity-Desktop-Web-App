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

    // Fetch real answer from Wikipedia
    let assistantReply = "I'm sorry, I couldn't find an answer to that right now.";
    try {
      const searchRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
        params: {
          action: 'query',
          list: 'search',
          srsearch: message,
          utf8: '',
          format: 'json',
        }
      });
      
      const searchResults = searchRes.data.query.search;
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
          }
        });
        
        const pages = pageRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract;
        
        if (extract) {
          assistantReply = `According to my search on **${title}**:\n\n${extract}`;
        }
      } else {
        assistantReply = "I couldn't find any factual information on that topic. Could you try rephrasing?";
      }
    } catch (apiErr) {
      console.error('Wikipedia API error:', apiErr);
      assistantReply = "I'm having trouble connecting to my knowledge base at the moment. Please try again later.";
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
