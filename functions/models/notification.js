const { Schema, model } = require("mongoose");

module.exports = model(
  "Notification",
  Schema({
    date: Date,
    content: String,
    user: { type: Schema.Types.ObjectID, ref: "User" },
    course: { type: Schema.Type.ObjectID, ref: "Course" },
    post: { type: Schema.Type.ObjectID, ref: "Post" },
    agenda: { type: Schema.Type.ObjectID, ref: "Agenda" },
  })
);