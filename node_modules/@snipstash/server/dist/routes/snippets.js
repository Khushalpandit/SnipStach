import { Router } from "express";
import { body } from "express-validator";
import { Snippet } from "../models/Snippet";
import { validateRequest } from "../middleware/validateRequest";
import { generateAutoTags } from "../utils/autoTagGenerator";
import { ApiError } from "@snipstash/shared";
const router = Router();
// Create snippet validation
const createSnippetValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("code").notEmpty().withMessage("Code is required"),
  body("language")
    .isIn([
      "javascript",
      "typescript",
      "python",
      "java",
      "csharp",
      "php",
      "ruby",
      "go",
      "rust",
      "swift",
      "kotlin",
      "bash",
      "html",
      "css",
      "sql",
      "json",
      "yaml",
      "markdown",
      "other",
    ])
    .withMessage("Invalid language"),
  body("description").optional().trim(),
  body("tags").optional().isArray(),
  body("folderId").optional().isMongoId().withMessage("Invalid folder ID"),
];
// Update snippet validation
const updateSnippetValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("code").optional().notEmpty().withMessage("Code cannot be empty"),
  body("language")
    .optional()
    .isIn([
      "javascript",
      "typescript",
      "python",
      "java",
      "csharp",
      "php",
      "ruby",
      "go",
      "rust",
      "swift",
      "kotlin",
      "bash",
      "html",
      "css",
      "sql",
      "json",
      "yaml",
      "markdown",
      "other",
    ])
    .withMessage("Invalid language"),
  body("description").optional().trim(),
  body("tags").optional().isArray(),
  body("folderId").optional().isMongoId().withMessage("Invalid folder ID"),
];
// Get snippets with filters
router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      language,
      tags,
      folderId,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const query = { userId: req.user.id };
    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (language) {
      query.language = language;
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    if (folderId) {
      query.folderId = folderId;
    }
    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const snippets = await Snippet.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Snippet.countDocuments(query);
    res.json({
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
// Create snippet
router.post(
  "/",
  createSnippetValidation,
  validateRequest,
  async (req, res, next) => {
    try {
      const { title, code, language, description, tags, folderId } = req.body;
      // Generate auto tags
      const autoTags = generateAutoTags(code, language);
      const snippet = new Snippet({
        userId: req.user.id,
        title,
        code,
        language,
        description,
        tags: tags || [],
        autoTags,
        folderId,
      });
      await snippet.save();
      res.status(201).json(snippet);
    } catch (error) {
      next(error);
    }
  }
);
// Update snippet
router.patch(
  "/:id",
  updateSnippetValidation,
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const update = req.body;
      // If code is updated, regenerate auto tags
      if (update.code) {
        update.autoTags = generateAutoTags(
          update.code,
          update.language || "javascript"
        );
      }
      const snippet = await Snippet.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { $set: update },
        { new: true }
      );
      if (!snippet) {
        throw new ApiError("Snippet not found", "NOT_FOUND", 404);
      }
      res.json(snippet);
    } catch (error) {
      next(error);
    }
  }
);
// Delete snippet
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const snippet = await Snippet.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!snippet) {
      throw new ApiError("Snippet not found", "NOT_FOUND", 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
// Increment usage count
router.post("/:id/use", async (req, res, next) => {
  try {
    const { id } = req.params;
    const snippet = await Snippet.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() },
      },
      { new: true }
    );
    if (!snippet) {
      throw new ApiError("Snippet not found", "NOT_FOUND", 404);
    }
    res.json(snippet);
  } catch (error) {
    next(error);
  }
});
export const snippetsRouter = router;
