const { Schema, model } = require("mongoose");

module.exports = model(
  "GroupSubmission",
  Schema({
    attachment: String,
    description: String,
    grade: { type: Number, min: 0 },
    createdAt: { type: Date, default: Date.now },
    submittedAt: Date,
    submittedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    groupActivity: { type: Schema.Types.ObjectId, ref: "GroupActivity" },

    comments: [
      {
        content: String,
        createdAt: { type: Date, required: true, default: Date.now },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  })
);
