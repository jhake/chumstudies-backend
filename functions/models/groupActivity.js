const { Schema, model } = require("mongoose");

module.exports = model(
  "GroupActivity",
  Schema({
    title: String,
    description: String,
    attachment: String,
    dueDate: Date,
    createdAt: { type: Date, default: Date.now },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
