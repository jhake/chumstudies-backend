const mongoose = require("mongoose");

const Course = require("../models/course.js");
const Teacher = require("../models/teacher.js");
const Student = require("../models/student.js");
const CourseStudent = require("../models/courseStudent.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  Course: {
    students: async (course) => {
      const courseStudents = await CourseStudent.find({ course: course.id });
      const filter = {
        _id: {
          $in: courseStudents?.map(({ student }) => mongoose.Types.ObjectId(student)) ?? [],
        },
      };
      return {
        data: await Student.find(filter),
        pagination: null,
      };
    },
    teacher: async (course) => await Teacher.findById(course.teacher),
    courseCode: async (course) => {
      const courseStudent = await CourseStudent.findOne({ course: course.id });
      if (!courseStudent) return null;

      return course.courseCode;
    },
  },

  Query: {
    courses: async (_, { pagination }, context) => {
      loginCheck(context);
      const limit = pagination?.limit ?? 10;
      const page = pagination?.page ?? 1;
      const skip = limit * (page - 1);

      const filter = {};

      const totalCount = await Course.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: await Course.find(filter).skip(skip).limit(limit),
        pagination: {
          totalCount,
          totalPages,
        },
      };
    },
  },

  Mutation: {
    createCourse: async (_, { input }, context) => {
      loginCheck(context);

      const teacher = await Teacher.findById(context.user.id);
      if (!teacher) throw Error("you must be a teacher to create a course");

      const course = new Course({
        ...input,
        teacher: teacher.id,
      });

      return await course.save();
    },

    joinCourse: async (_, { courseCode }, context) => {
      loginCheck(context);

      const student = await Student.findById(context.user.id);
      if (!student) throw Error("you must be a student to join a course");

      const course = await Course.findOne({ courseCode });
      if (!course) throw Error("invalid course code");

      const courseStudent = await CourseStudent.findOne({
        course: course.id,
        student: student.id,
      });
      if (courseStudent) throw Error("already in course");

      const newCourseStudent = new CourseStudent({
        student: student.id,
        course: course.id,
      });
      await newCourseStudent.save();

      return {
        course: course,
        student: student,
      };
    },
  },
};
