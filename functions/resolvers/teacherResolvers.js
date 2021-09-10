const User = require("../models/user.js");
const Teacher = require("../models/teacher.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  Teacher: {
    user: async (teacher) => await User.findById(teacher.id),
  },

  Mutation: {
    createTeacher: async (_, __, context) => {
      loginCheck(context);
      const teacher = new Teacher({
        _id: context.user.id,
        user: context.user.id,
      });
      return await teacher.save();
    },
  },
};
