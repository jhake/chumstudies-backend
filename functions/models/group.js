const { Schema, model } = require("mongoose");

const generateRandomString = require("../utils/generateRandomString.js");

module.exports = model(
  "Group",
  Schema({
    name: String,
    groupCode: {
      type: String,
      default: function () {
        const { name, course } = this;

        if (course) return null;
        return `${name.replace(/\s+/g, "")}-${generateRandomString(10)}`;
      },
    },
    isActive: { type: Boolean, default: true },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  })
);
