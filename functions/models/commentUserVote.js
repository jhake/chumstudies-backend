const { Schema, model } = require("mongoose");

module.exports = model(
  "CommentUserVote",
  Schema({
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    vote: { type: Number, default: 0 },
  })
);
