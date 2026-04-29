import Conversation from '../models/Conversation.js';

const MOCK_RESPONSES = [
  "That's an interesting thought! I can help you explore that further.",
  "Based on what you've shared, here are some key points to consider...",
  "I understand. Let me break this down for you.",
  "Great question! This relates to several important aspects.",
  "I see where you're coming from. Have you thought about...",
  "That's a common challenge. Here are some strategies that might help.",
  "Exactly! This is crucial for productivity and focus.",
];

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

    // Generate mock response
    const mockResponse =
      MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

    conversation.messages.push({
      role: 'assistant',
      content: mockResponse,
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
