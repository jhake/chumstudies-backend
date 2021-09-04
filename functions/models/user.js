const { Schema, model } = require("mongoose");

const User = model(
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
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    uploadPreset: String,
  })
);

module.exports = User;
