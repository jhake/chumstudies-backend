<<<<<<< HEAD
const {Schema, model } = require("mongoose");

module.exports = model(
    "Schedule",
    Schema({
        subjectcode: String,
        subjectname: String,
        faculty: String,
        schedule: String,
        user: { type: Schema.Types.ObjectID, ref: "User"},
    })
);
=======
const { Schema, model } = require("mongoose");

module.exports = model(
  "Schedule",
  Schema({
    subjectCode: String,
    subjectName: String,
    faculty: String,
    schedule: String,
    user: { type: Schema.Types.ObjectID, ref: "User" },
  })
);
>>>>>>> 06cc4e1ac5bb6e321193564273ddca72445d5ba0
