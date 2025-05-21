import mongoose, { Schema } from "mongoose";
const folderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
export const Folder = mongoose.model("Folder", folderSchema);
