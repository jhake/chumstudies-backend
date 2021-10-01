const { Schema, model } = require("mongoose");

module.exports = model(
  "Notification",
  Schema({
    date: Date,
    content: String,
    user: { type: Schema.Types.ObjectID, ref: "User" },
    course: { type: Schema.Types.ObjectID, ref: "Course" },
    post: { type: Schema.Types.ObjectID, ref: "Post" },
    agenda: { type: Schema.Types.ObjectID, ref: "Agenda" },
  })
);
