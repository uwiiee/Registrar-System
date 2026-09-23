const mongoose = require("mongoose");
const { ALL_DEPARTMENTS } = require("../constants/departments");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "important", "schedule"],
      default: "general",
    },
    department: {
      type: String,
      enum: ALL_DEPARTMENTS,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Announcement", announcementSchema);
