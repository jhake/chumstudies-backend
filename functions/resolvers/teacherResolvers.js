const { Course, User } = require("../models/index.js");

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
};
