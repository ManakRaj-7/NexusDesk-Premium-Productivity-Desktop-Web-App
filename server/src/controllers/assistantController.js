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
    const GREETINGS = ['hi', 'hello', 'hey', 'yo', 'sup', 'hi there', 'hello there', 'hola', 'namaste'];
    let assistantReply = "";

    // 1. Handle Greetings
    if (GREETINGS.some(g => lowerMsg === g || lowerMsg.startsWith(g + ' ')) || lowerMsg.length < 3) {
      assistantReply = "Hey there! I'm your NexusDesk AI. I'm connected to the web and ready to help you with research, tasks, or just a quick chat. What's on your mind?";
    } else {
      // 2. Intelligence: Map common abbreviations to full terms using regex for robustness
      let searchQuery = message;
      const mappers = {
        'ai': 'Artificial Intelligence',
        'ml': 'Machine Learning',
        'it': 'Information Technology',
        'ui': 'User Interface',
        'ux': 'User Experience',
        'api': 'Application Programming Interface'
      };
      
      for (const [key, val] of Object.entries(mappers)) {
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (regex.test(message)) {
          searchQuery = val;
          break;
        }
      }

      const isAdviceQuery = /how|why|should|can|advice|tips|guide|step/i.test(lowerMsg);
      
      // 3. Logic: Prioritize DuckDuckGo for advice/questions, Wikipedia for factual definitions
      const trySearch = async (source) => {
        if (source === 'wiki') {
          try {
            const searchRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
              params: { action: 'query', list: 'search', srsearch: searchQuery, utf8: '', format: 'json' },
              headers: { 'User-Agent': 'NexusDesk/1.2' },
              timeout: 6000
            });
            const searchResults = searchRes.data.query?.search;
            if (searchResults && searchResults.length > 0) {
              const result = searchResults[0];
              // Basic relevance check: title should share at least one word with search
              const titleWords = result.title.toLowerCase().split(' ');
              const queryWords = searchQuery.toLowerCase().split(' ');
              const isRelevant = queryWords.some(w => w.length > 3 && titleWords.includes(w));
              
              if (isRelevant || queryWords.length < 3) {
                const pageRes = await axios.get(`https://en.wikipedia.org/w/api.php`, {
                  params: { action: 'query', prop: 'extracts', exintro: true, explaintext: true, titles: result.title, format: 'json' },
                  headers: { 'User-Agent': 'NexusDesk/1.2' },
                  timeout: 6000
                });
                const pages = pageRes.data.query?.pages;
                const pageId = pages ? Object.keys(pages)[0] : null;
                let extract = pageId && pageId !== '-1' ? pages[pageId].extract : null;
                if (extract) {
                  const wantsMore = /more|detail|long|explain|everything|full/i.test(message);
                  if (!wantsMore) {
                    const paragraphs = extract.split('\n').filter(p => p.trim().length > 0);
                    extract = paragraphs[0];
                    if (extract.length > 500) extract = extract.substring(0, 500) + '... (Ask for "more")';
                  }
                  const related = searchResults.slice(1, 4).map(r => r.title).join(', ');
                  return `**${result.title}**\n\n${extract}\n\n*Related: ${related}*`;
                }
              }
            }
          } catch (e) { console.error('Wiki Error:', e.message); }
        } else {
          try {
            const ddgRes = await axios.get(`https://api.duckduckgo.com/`, {
              params: { q: message, format: 'json', no_html: 1, skip_disambig: 1 },
              timeout: 5000
            });
            if (ddgRes.data.AbstractText) return ddgRes.data.AbstractText;
          } catch (e) { console.error('DDG Error:', e.message); }
        }
        return null;
      };

      if (isAdviceQuery) {
        assistantReply = await trySearch('ddg') || await trySearch('wiki');
      } else {
        assistantReply = await trySearch('wiki') || await trySearch('ddg');
      }
    }

    if (!assistantReply) {
      assistantReply = "I'm sorry, I'm having a hard time finding a relevant answer for that. Could you try rephrasing your question?";
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
