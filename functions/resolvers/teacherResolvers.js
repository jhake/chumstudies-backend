const User = require("../models/user.js");
const Teacher = require("../models/teacher.js");
const Course = require("../models/course.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  Teacher: {
    user: async (teacher) => await User.findById(teacher.id),
    courses: async (teacher) => {
      const filter = { teacher: teacher.id };

      return {
        data: await Course.find(filter),
        pagination: null,
      };
    },
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
