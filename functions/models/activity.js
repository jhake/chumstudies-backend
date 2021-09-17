const { Schema, model } = require("mongoose");

module.exports = model(
  "Activity",
  Schema({
    title: String,
    description: String,
    attachment: String,
    dueAt: Date,
    type: String,
    createdAt: { type: Date, default: Date.now },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
