const { Schema, model } = require("mongoose");

module.exports = model(
  "Student",
  Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
  })
);
