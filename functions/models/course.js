const { Schema, model } = require("mongoose");

module.exports = model(
  "Course",
  Schema({
    name: String,
  })
);
