import Session from '../models/Session.js';
import User from '../models/User.js';
import { createSessionSchema } from '../validations/schemas.js';

export const createSession = async (req, res, next) => {
  try {
    const { type, duration } = createSessionSchema.parse(req.body);

    const session = new Session({
      userId: req.user.userId,
      type,
      duration,
    });

    await session.save();

    // Update user streak
    const user = await User.findById(req.user.userId);
    const lastSession = user.focusStreak.lastSessionDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastSession) {
      user.focusStreak.current = 1;
    } else {
      const lastDate = new Date(lastSession);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.focusStreak.current += 1;
        if (user.focusStreak.current > user.focusStreak.longestStreak) {
          user.focusStreak.longestStreak = user.focusStreak.current;
        }
      } else if (diffDays > 1) {
        user.focusStreak.current = 1;
      }
    }

    user.focusStreak.lastSessionDate = today;
    await user.save();

    res.status(201).json({
      message: 'Session created',
      session,
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { days = 7 } = req.query;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));

    const sessions = await Session.find({
      userId,
      completedAt: { $gte: fromDate },
    }).sort({ completedAt: -1 });

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

    const user = await User.findById(userId);

    res.json({
      sessions,
      stats: {
        totalSessions: sessions.length,
        totalDuration,
        avgDuration: Math.round(avgDuration),
        currentStreak: user.focusStreak.current,
        longestStreak: user.focusStreak.longestStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
    }

    res.json({ message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};
