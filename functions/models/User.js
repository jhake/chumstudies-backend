const { Schema, model } = require("mongoose");

const User = model(
  "User",
  Schema({
    isTeacher: Boolean,
    services: {
      password: {
        bcrypt: String,
      },
    },
    createdAt: Number,
    updatedAt: Number,
    username: String,
    emails: [{ address: String, verified: Boolean }],
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  })
);

module.exports = User;
