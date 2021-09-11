const { Schema, model } = require("mongoose");

module.exports = model(
  "Course",
  Schema({
    name: String,
    subjCode: String,
    courseCode: String,
    yearAndSection: String,
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
  })
);
