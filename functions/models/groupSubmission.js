const { Schema, model } = require("mongoose");

module.exports = model(
  "GroupSubmission",
  Schema({
    attachment: String,
    description: String,
    grade: { type: Number, min: 0, max: 100 },
    submittedAt: Date,
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
