const { Schema, model } = require("mongoose");

module.exports = model(
  "GroupStudent",
  Schema({
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    type: {
      type: String,
      enum: ["leader", "admin", "regular"],
      default: "regular",
    },
  })
);
