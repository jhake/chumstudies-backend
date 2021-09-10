const { Schema, model } = require("mongoose");

module.exports = model(
  "Group",
  Schema({
    name: String,
    groupCode: String,
    isActive: { type: Boolean, default: true },
    type: String,
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
