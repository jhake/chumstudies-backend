const { Course, User } = require("../models/index.js");

module.exports = {
  Teacher: {
    user: async (teacher) => await User.findById(teacher.id),
    courses: async (teacher, _, context) => {
      if (context.user.id !== teacher.id) throw Error("can't query other's courses");
      const filter = { teacher };

      return {
        data: await Course.find(filter),
        pagination: null,
      };
    },
  },
};
