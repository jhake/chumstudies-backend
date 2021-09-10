const User = require("../models/user.js");
const Student = require("../models/student.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  Student: {
    user: async (student) => await User.findById(student.id),
  },

  Mutation: {
    createStudent: async (_, __, context) => {
      loginCheck(context);
      const student = new Student({
        _id: context.user.id,
        user: context.user.id,
      });
      return await student.save();
    },
  },
};
