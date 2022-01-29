const { Schema, model } = require("mongoose");

module.exports = model(
  "User",
  Schema({
    emails: [{ address: String, verified: Boolean }],

    firstName: String,
    middleName: String,
    lastName: String,

    yearLevel: String,
    courseDept: String,
    section: { type: Number, default: 0 },
    schoolIdNumber: String,
    isAdmin: Boolean,

    profilePicture: String,
    uploadPreset: String,
  })
);
