import mongoose, { Document, Schema } from 'mongoose';
import { Folder as IFolder } from '@snipstash/shared';

export interface FolderDocument extends IFolder, Document {}

const folderSchema = new Schema<FolderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better search performance
folderSchema.index({ userId: 1, name: 1 });

export const Folder = mongoose.model<FolderDocument>('Folder', folderSchema); 