const { Schema, model } = require("mongoose");

module.exports = model(
  "Task",
  Schema({
    attachment: String,
    description: String,
    grade: { type: Number, min: 0, max: 100 },
    dueDate: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    groupSubmission: { type: Schema.Types.ObjectId, ref: "GroupSubmission" },
  })
);
