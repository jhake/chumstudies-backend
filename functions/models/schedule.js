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