import Note from '../models/Note.js';
import Activity from '../models/Activity.js';
import { createNoteSchema } from '../validations/schemas.js';

export const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, folderId } = createNoteSchema.parse(req.body);

    const note = new Note({
      title,
      content,
      tags: tags || [],
      folderId,
      userId: req.user.userId,
    });

    await note.save();

    // Log activity
    await Activity.create({
      userId: req.user.userId,
      type: 'created',
      targetModel: 'Note',
      targetId: note._id,
      metadata: { title },
    });

    res.status(201).json({
      message: 'Note created',
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, tags, starred } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (starred === 'true') {
      query.starred = true;
    }

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      notes,
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

export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found', code: 'NOT_FOUND' });
    }

    res.json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { title, content, tags, folderId, starred } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        $set: { title, content, tags, folderId, starred, updatedAt: Date.now() },
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found', code: 'NOT_FOUND' });
    }

    await Activity.create({
      userId: req.user.userId,
      type: 'updated',
      targetModel: 'Note',
      targetId: note._id,
      metadata: { title },
    });

    res.json({
      message: 'Note updated',
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found', code: 'NOT_FOUND' });
    }

    await Activity.create({
      userId: req.user.userId,
      type: 'deleted',
      targetModel: 'Note',
      targetId: note._id,
      metadata: { title: note.title },
    });

    res.json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

export const searchNotes = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ results: [] });
    }

    const results = await Note.find(
      { userId: req.user.userId, $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.json({ results });
  } catch (error) {
    next(error);
  }
};
