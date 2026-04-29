import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
    },
    tags: [{ type: String, lowercase: true }],
    notes: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    saved: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create indexes
linkSchema.index({ userId: 1, category: 1 });
linkSchema.index({ userId: 1, createdAt: -1 });

const Link = mongoose.model('Link', linkSchema);
export default Link;
