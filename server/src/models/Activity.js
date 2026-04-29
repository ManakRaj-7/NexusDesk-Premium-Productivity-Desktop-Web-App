import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'starred', 'completed'],
      required: true,
    },
    targetModel: {
      type: String,
      enum: ['Note', 'Task', 'Folder', 'Link', 'Session'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    metadata: {
      title: String,
      category: String,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Create indexes
activitySchema.index({ userId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
