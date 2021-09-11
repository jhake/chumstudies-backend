const { Schema, model } = require("mongoose");

module.exports = model(
  "Post",
  Schema({
    content: String,
    attachment: String,
    category: {
      type: String,
      enum: ["post", "question"],
      default: "post",
    },
    createdAt: { type: Date, default: Date.now },
    tags: [String],
    user: { type: Schema.Types.ObjectId, ref: "User" },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
  })
);
