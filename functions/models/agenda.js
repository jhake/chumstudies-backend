const { Schema, model } = require("mongoose");

module.exports = model(
  "Agenda",
  Schema({
    title: String,
    startsAt: Date,
    endsAt: Date,
    repeat: String,
    attachment: String,
    description: String,
    status: String,
    user: { type: Schema.Types.ObjectID, ref: "User" },
  })
);
