const { Schema, model } = require("mongoose");

module.exports = model(
  "Schedule",
  Schema({
    subjectCode: String,
    subjectName: String,
    faculty: String,
    schedule: String,
    user: { type: Schema.Types.ObjectID, ref: "User" },
  })
);
