const { Schema, model } = require("mongoose");

module.exports = model(
  "User",
  Schema({
    emails: [{ address: String, verified: Boolean }],

    firstName: String,
    middleName: String,
    lastName: String,

    schoolIdNumber: String,
    isAdmin: { type: Boolean, default: false },

    profilePicture: String,
    uploadPreset: String,
  })
);
