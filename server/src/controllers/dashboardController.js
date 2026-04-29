import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Note from '../models/Note.js';
import Activity from '../models/Activity.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Get user and stats
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    // Count tasks by status
    const tasksCount = await Task.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const tasksStats = {
      todo: 0,
      doing: 0,
      done: 0,
    };
    tasksCount.forEach(t => {
      tasksStats[t._id] = t.count;
    });

    // Get today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const todaysTasks = await Task.find({
      userId,
      dueDate: { $gte: today, $lt: tomorrow },
    }).limit(5);

    // Get recent notes
    const recentNotes = await Note.find({ userId }).sort({ updatedAt: -1 }).limit(5);

    // Get focus stats
    const todaysSessions = await Session.find({
      userId,
      completedAt: { $gte: today, $lt: tomorrow },
    });

    const focusTimeToday = todaysSessions.reduce((sum, s) => sum + s.duration, 0);

    // Get streak
    const { current: currentStreak, longestStreak } = user.focusStreak;

    res.json({
      tasksStats,
      todaysTasks,
      recentNotes,
      focusTimeToday,
      currentStreak,
      longestStreak,
      totalNotes: await Note.countDocuments({ userId }),
      totalTasks: await Task.countDocuments({ userId }),
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityFeed = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await Activity.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ activities });
  } catch (error) {
    next(error);
  }
};

export const getPinnedItems = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const pinnedNotes = await Note.find({ userId, starred: true }).limit(5);
    const pinnedTasks = await Task.find({ userId, status: { $ne: 'done' } })
      .sort({ priority: -1, dueDate: 1 })
      .limit(5);

    res.json({
      notes: pinnedNotes,
      tasks: pinnedTasks,
    });
  } catch (error) {
    next(error);
  }
};
