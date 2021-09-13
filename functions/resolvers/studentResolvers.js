const { User, CourseStudent, Course } = require("../models/index.js");

module.exports = {
  Student: {
    user: async (student) => await User.findById(student.id),
    courses: async (student) => {
      const courseStudents = await CourseStudent.find({ student: student.id });

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
  },
};
