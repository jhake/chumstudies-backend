const { Schema, model } = require("mongoose");

module.exports = model(
  "Task",
  Schema({
    attachment: String,
    description: String,
    dueAt: Date,
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    groupSubmission: { type: Schema.Types.ObjectId, ref: "GroupSubmission" },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "UNDER_REVIEW", "MISSING", "DONE"],
      default: "TODO",
    },

    comments: [
      {
        content: String,
        createdAt: { type: Date, required: true, default: Date.now },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  })
);
