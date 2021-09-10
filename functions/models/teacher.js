const { Schema, model } = require("mongoose");

module.exports = model(
  "Teacher",
  Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
  })
);
