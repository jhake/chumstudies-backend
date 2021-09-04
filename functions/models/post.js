const { Schema, model } = require("mongoose");

module.exports = model(
  "Post",
  Schema({
    content: String,
    attachment: String,
    createdAt: { type: Date, required: true, default: Date.now },
    author: { type: Schema.Types.ObjectId, ref: "User" },
  })
);
