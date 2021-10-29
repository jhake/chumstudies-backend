const { Schema, model } = require("mongoose");

module.exports = model(
  "Submission",
  Schema({
    attachment: String,
    description: String,
    grade: { type: Number, min: 0 },
    createdAt: { type: Date, default: Date.now },
    submittedAt: Date,
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    activity: { type: Schema.Types.ObjectId, ref: "Activity" },

    comments: [
      {
        content: String,
        createdAt: { type: Date, required: true, default: Date.now },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  })
);
