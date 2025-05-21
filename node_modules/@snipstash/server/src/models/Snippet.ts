import mongoose, { Document, Schema } from 'mongoose';
import { Snippet as ISnippet, Language, AutoTag } from '@snipstash/shared';

export interface SnippetDocument extends ISnippet, Document {}

const snippetSchema = new Schema<SnippetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: Object.values(Language),
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    autoTags: [{
      type: String,
      enum: Object.values(AutoTag),
    }],
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better search performance
snippetSchema.index({ userId: 1, title: 1 });
snippetSchema.index({ userId: 1, tags: 1 });
snippetSchema.index({ userId: 1, autoTags: 1 });
snippetSchema.index({ userId: 1, language: 1 });
snippetSchema.index({ userId: 1, folderId: 1 });

export const Snippet = mongoose.model<SnippetDocument>('Snippet', snippetSchema); 