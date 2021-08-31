const { Schema, model } = require("mongoose");

const Course = model(
  "Course",
  Schema({
    name: String,
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  })
);

module.exports = Course;
