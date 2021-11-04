const { Schema, model } = require("mongoose");

module.exports = model(
  "Task",
  Schema({
    attachment: String,
    title: String,
    note: String,
    description: String,
    dueAt: Date,
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    groupSubmission: { type: Schema.Types.ObjectId, ref: "GroupSubmission" },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "UNDER_REVIEW", "MISSING", "DONE"],
      default: "TODO",
    },
    createdAt: { type: Date, default: Date.now },
    submittedAt: Date,

    comments: [
      {
        content: String,
        createdAt: { type: Date, required: true, default: Date.now },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  })
);
