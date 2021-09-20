const { User, CourseStudent, Course, Group, GroupStudent } = require("../models/index.js");

module.exports = {
  Student: {
    user: async (student) => await User.findById(student.id),
    courses: async (student, _, context) => {
      if (context.user.id !== student.id) throw Error("can't query other's courses");

      const courseStudents = await CourseStudent.find({ student });

      const filter = {
        _id: {
          $in: courseStudents?.map(({ course }) => course) ?? [],
        },
      };

      return {
        data: await Course.find(filter),
        pagination: null,
      };
    },
    groups: async (student, _, context) => {
      if (context.user.id !== student.id) throw Error("can't query other's groups");

      const groupStudents = await GroupStudent.find({ student });

      const filter = {
        _id: {
          $in: groupStudents?.map(({ group }) => group) ?? [],
        },
      };

      return {
        data: await Group.find(filter),
        pagination: null,
      };
    },
  },
};
