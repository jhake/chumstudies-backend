const { Schema, model } = require("mongoose");

module.exports = model(
  "Comment",
  Schema({
    content: String,
    score: Number,
    createdAt: { type: Date, required: true, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
  })
);
