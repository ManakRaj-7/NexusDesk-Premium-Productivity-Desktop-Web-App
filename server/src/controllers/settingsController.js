import Settings from '../models/Settings.js';

export const getUserSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.userId });

    if (!settings) {
      settings = new Settings({ userId: req.user.userId });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const {
      theme,
      sidebarCollapsed,
      notificationsEnabled,
      emailNotifications,
      autoSave,
      defaultFocusDuration,
      defaultBreakDuration,
    } = req.body;

    let settings = await Settings.findOne({ userId: req.user.userId });

    if (!settings) {
      settings = new Settings({ userId: req.user.userId });
    }

    settings.set({
      theme,
      sidebarCollapsed,
      notificationsEnabled,
      emailNotifications,
      autoSave,
      defaultFocusDuration,
      defaultBreakDuration,
    });

    await settings.save();

    res.json({
      message: 'Settings updated',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
