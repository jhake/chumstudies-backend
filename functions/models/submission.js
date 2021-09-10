const { Schema, model } = require("mongoose");

module.exports = model(
  "Submission",
  Schema({
    attachment: String,
    description: String,
    grade: { type: Number, min: 0, max: 100 },
    submittedAt: Date,
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    activity: { type: Schema.Types.ObjectId, ref: "Activity" },
  })
);
