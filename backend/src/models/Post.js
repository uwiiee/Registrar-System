const mongoose = require("mongoose");
const { ALL_DEPARTMENTS } = require("../constants/departments");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
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
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Post", postSchema);
