const { Schema, model } = require("mongoose");

module.exports = model(
  "Activity",
  Schema({
    title: String,
    description: String,
    attachment: String,
    dueAt: Date,
    createdAt: { type: Date, default: Date.now },
    course: { type: Schema.Types.ObjectId, ref: "Course" },

    comments: [
      {
        content: String,
        createdAt: { type: Date, required: true, default: Date.now },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  })
);
