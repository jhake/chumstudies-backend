const { Schema, model } = require("mongoose");

module.exports = model(
  "UserCourse",
  Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
