const { Schema, model } = require("mongoose");

module.exports = model(
  "Group",
  Schema({
    name: String,
    groupCode: String,
    isActive: { type: Boolean, default: true },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
