const { Schema, model } = require("mongoose");

module.exports = model(
  "Activity",
  Schema({
    title: String,
    description: String,
    attachment: String,
    dueDate: Date,
    type: String,
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
