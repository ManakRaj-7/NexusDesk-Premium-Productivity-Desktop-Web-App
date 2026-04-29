import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['pomodoro', 'focus'],
      default: 'pomodoro',
    },
    duration: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    focusTimeToday: {
      type: Number,
      default: 0,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Create indexes
sessionSchema.index({ userId: 1, completedAt: -1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
