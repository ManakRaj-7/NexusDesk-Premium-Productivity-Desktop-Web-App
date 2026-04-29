import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { COOKIE_OPTIONS } from '../constants/index.js';
import { signupSchema, loginSchema, updateProfileSchema } from '../validations/schemas.js';

export const signup = async (req, res, next) => {
  try {
    const { email, username, password } = signupSchema.parse(req.body);

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists', code: 'USER_EXISTS' });
    }

    // Create new user
    const user = new User({ email, username, password });
    await user.save();

    // Create default settings
    const settings = new Settings({ userId: user._id });
    await settings.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      message: 'Signup successful',
      user: user.toJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDS' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout successful' });
};

export const refreshToken = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    res.cookie('accessToken', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    res.json({
      message: 'Token refreshed',
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const settings = await Settings.findOne({ userId: user._id });

    res.json({
      user: user.toJSON(),
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, avatar } = updateProfileSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'profile.fullName': fullName,
          'profile.bio': bio,
          'profile.avatar': avatar,
        },
      },
      { new: true }
    );

    res.json({
      message: 'Profile updated',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
