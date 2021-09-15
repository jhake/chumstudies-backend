const { Schema, model } = require("mongoose");

const generateRandomString = require("../utils/generateRandomString.js");

module.exports = model(
  "Course",
  Schema({
    name: String,
    subjCode: String,
    courseCode: {
      type: String,
      default: function () {
        const { subjCode, yearAndSection } = this;
        return `${subjCode}-${yearAndSection}-${generateRandomString(5)}`;
      },
    },
    yearAndSection: String,
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
  })
);
