const { Course, Teacher, CourseStudent, Student, Group } = require("../models/index.js");
const { loginCheck, isCourseStudent } = require("../utils/checks.js");

module.exports = {
  Course: {
    groups: async (course) => ({ data: await Group.find({ course }), pagination: null }),
    students: async (course) => {
      const courseStudents = await CourseStudent.find({ course });
      const filter = {
        _id: {
          $in: courseStudents?.map(({ student }) => student) ?? [],
        },
      };
      return {
        data: await Student.find(filter),
        pagination: null,
      };
    },
    studentCount: async (course) => await CourseStudent.countDocuments({ course }),
    teacher: async (course) => await Teacher.findById(course.teacher),
    courseCode: async (course, _, context) => {
      const courseStudent = await CourseStudent.findOne({ course, student: context.user.id });
      if (!courseStudent && course.teacher != context.user.id) return null;

      return course.courseCode;
    },
  },

  Query: {
    course: async (_, { courseId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      const inCourse = (await isCourseStudent(userId, courseId)) || course.teacher == userId;
      if (!inCourse) throw Error("not in course");

      return course;
    },
    courses: async (_, { pagination }, context) => {
      loginCheck(context);
      const limit = pagination?.limit ?? 30;
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
    studentCourses: async (_, __, context) => {
      loginCheck(context);

      const courseStudents = await CourseStudent.find({ student: context.user.id });
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

    teacherCourses: async (_, __, context) => {
      loginCheck(context);

      const filter = { teacher: context.user.id };

      return {
        data: await Course.find(filter),
      };
    },
  },

  Mutation: {
    createCourse: async (_, args, context) => {
      loginCheck(context);

      const teacher = await Teacher.findById(context.user.id);
      if (!teacher) throw Error("you must be a teacher to create a course");

      const course = new Course({
        ...args,
        teacher,
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
        course,
        student,
      });
      if (courseStudent) throw Error("already in course");

      const newCourseStudent = new CourseStudent({
        student,
        course,
      });
      await newCourseStudent.save();

      return course;
    },
  },
};
