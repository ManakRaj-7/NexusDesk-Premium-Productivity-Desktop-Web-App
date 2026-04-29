import Folder from '../models/Folder.js';

export const createFolder = async (req, res, next) => {
  try {
    const { name, icon, color, parentId } = req.body;

    const folder = new Folder({
      name,
      icon: icon || 'folder',
      color: color || 'slate',
      parentId,
      userId: req.user.userId,
    });

    await folder.save();

    res.status(201).json({
      message: 'Folder created',
      folder,
    });
  } catch (error) {
    next(error);
  }
};

export const getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ userId: req.user.userId }).sort({ order: 1 });

    res.json({ folders });
  } catch (error) {
    next(error);
  }
};

export const getFolderTree = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get all folders
    const allFolders = await Folder.find({ userId }).sort({ order: 1 });

    // Build tree structure
    const buildTree = (parentId = null) => {
      return allFolders
        .filter(f => (f.parentId || null) === parentId)
        .map(folder => ({
          ...folder.toObject(),
          children: buildTree(folder._id),
        }));
    };

    const tree = buildTree();

    res.json({ tree });
  } catch (error) {
    next(error);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    const { name, icon, color, order } = req.body;

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        $set: { name, icon, color, order, updatedAt: Date.now() },
      },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found', code: 'NOT_FOUND' });
    }

    res.json({
      message: 'Folder updated',
      folder,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found', code: 'NOT_FOUND' });
    }

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    next(error);
  }
};
