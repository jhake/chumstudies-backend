const { Schema, model } = require("mongoose");

module.exports = model(
  "CourseStudent",
  Schema({
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
