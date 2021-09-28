const { Schema, model } = require("mongoose");

module.exports = model(
  "Comment",
  Schema({
    content: String,
    score: { type: Number, default: 0 },
    createdAt: { type: Date, required: true, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
  })
);
