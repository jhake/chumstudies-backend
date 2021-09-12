const mongoose = require("mongoose");

const { User, CourseStudent, Course, Student } = require("../models/index.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  Student: {
    user: async (student) => await User.findById(student.id),
    courses: async (student) => {
      const courseStudents = await CourseStudent.find({ student: student.id });

      const filter = {
        _id: {
          $in: courseStudents?.map(({ course }) => mongoose.Types.ObjectId(course)) ?? [],
        },
      };

      return {
        data: await Course.find(filter),
        pagination: null,
      };
    },
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
