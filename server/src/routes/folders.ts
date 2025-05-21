import { Router } from 'express';
import { body } from 'express-validator';
import { Folder } from '../models/Folder';
import { Snippet } from '../models/Snippet';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { ApiError } from '@snipstash/shared';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create folder validation
const createFolderValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
];

// Update folder validation
const updateFolderValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim(),
];

// Get all folders
router.get('/', async (req, res, next) => {
  try {
    const folders = await Folder.find({ userId: req.user!.id }).sort({
      name: 1,
    });
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

// Create folder
router.post(
  '/',
  createFolderValidation,
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, description } = req.body;

      const folder = new Folder({
        userId: req.user!.id,
        name,
        description,
      });

      await folder.save();
      res.status(201).json(folder);
    } catch (error) {
      next(error);
    }
  }
);

// Update folder
router.patch(
  '/:id',
  updateFolderValidation,
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const update = req.body;

      const folder = await Folder.findOneAndUpdate(
        { _id: id, userId: req.user!.id },
        { $set: update },
        { new: true }
      );

      if (!folder) {
        throw new ApiError('Folder not found', 'NOT_FOUND', 404);
      }

      res.json(folder);
    } catch (error) {
      next(error);
    }
  }
);

// Delete folder
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if folder exists
    const folder = await Folder.findOne({
      _id: id,
      userId: req.user!.id,
    });

    if (!folder) {
      throw new ApiError('Folder not found', 'NOT_FOUND', 404);
    }

    // Remove folder reference from snippets
    await Snippet.updateMany(
      { folderId: id, userId: req.user!.id },
      { $unset: { folderId: 1 } }
    );

    // Delete folder
    await folder.deleteOne();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get folder with snippets
router.get('/:id/snippets', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if folder exists
    const folder = await Folder.findOne({
      _id: id,
      userId: req.user!.id,
    });

    if (!folder) {
      throw new ApiError('Folder not found', 'NOT_FOUND', 404);
    }

    // Get snippets in folder
    const skip = (Number(page) - 1) * Number(limit);
    const snippets = await Snippet.find({
      folderId: id,
      userId: req.user!.id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Snippet.countDocuments({
      folderId: id,
      userId: req.user!.id,
    });

    res.json({
      folder,
      snippets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

export const foldersRouter = router; 