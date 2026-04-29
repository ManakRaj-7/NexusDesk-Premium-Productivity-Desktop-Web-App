import Link from '../models/Link.js';
import { createLinkSchema } from '../validations/schemas.js';

export const createLink = async (req, res, next) => {
  try {
    const { title, url, category, tags, notes } = createLinkSchema.parse(req.body);

    const link = new Link({
      title,
      url,
      category: category || 'general',
      tags: tags || [],
      notes,
      userId: req.user.userId,
    });

    await link.save();

    res.status(201).json({
      message: 'Link saved',
      link,
    });
  } catch (error) {
    next(error);
  }
};

export const getLinks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    const links = await Link.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Link.countDocuments(query);

    res.json({
      links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLinkById = async (req, res, next) => {
  try {
    const link = await Link.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found', code: 'NOT_FOUND' });
    }

    res.json(link);
  } catch (error) {
    next(error);
  }
};

export const updateLink = async (req, res, next) => {
  try {
    const { title, url, category, tags, notes } = req.body;

    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        $set: { title, url, category, tags, notes, updatedAt: Date.now() },
      },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ error: 'Link not found', code: 'NOT_FOUND' });
    }

    res.json({
      message: 'Link updated',
      link,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLink = async (req, res, next) => {
  try {
    const link = await Link.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found', code: 'NOT_FOUND' });
    }

    res.json({ message: 'Link deleted' });
  } catch (error) {
    next(error);
  }
};
