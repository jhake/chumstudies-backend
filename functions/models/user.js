const { Schema, model } = require("mongoose");

module.exports = model(
  "User",
  Schema({
    services: {
      password: {
        bcrypt: String,
      },
    },
    createdAt: Number,
    updatedAt: Number,
    username: String,
    emails: [{ address: String, verified: Boolean }],

    isTeacher: Boolean,
    uploadPreset: String,
  })
);
