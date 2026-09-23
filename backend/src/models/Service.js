const mongoose = require("mongoose");
const { ALL_DEPARTMENTS } = require("../constants/departments");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    avgDurationMins: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      enum: ALL_DEPARTMENTS,
      required: true,
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt
  },
);

module.exports = mongoose.model("Service", serviceSchema);
