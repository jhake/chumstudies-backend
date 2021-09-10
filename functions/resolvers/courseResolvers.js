const Course = require("../models/course.js");
const Teacher = require("../models/teacher.js");
const Student = require("../models/student.js");
const CourseStudent = require("../models/courseStudent.js");
const { loginCheck } = require("../utils/checks.js");
const generateRandomString = require("../utils/generateRandomString.js");

module.exports = {
  Course: {
    // attendees: async (course) => {
    //   const userCourses = await UserCourse.find({ course: course.id });
    //   const filter = {
    //     _id: {
    //       $in:
    //         userCourses?.map(({ user }) => mongoose.Types.ObjectId(user)) ?? [],
    //     },
    //   };
    //   return {
    //     data: await User.find(filter),
    //     pagination: null,
    //   };
    // },
    teacher: async (course) => await Teacher.findById(course.teacher),
  },

  Query: {
    courses: async (_, args, context) => {
      loginCheck(context);
      const limit = args?.pagination?.limit ?? 10;
      const page = args?.pagination?.page ?? 1;
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
    createCourse: async (_, args, context) => {
      loginCheck(context);

      const teacher = await Teacher.findById(context.user.id);
      if (!teacher) throw Error("you must be a teacher to create a course");

      const { subjCode, yearAndSection } = args.input;

      const course = new Course({
        ...args.input,
        courseCode: `${subjCode}-${yearAndSection}-${generateRandomString(5)}`,
        teacher: teacher.id,
      });

      return await course.save();
    },

    joinCourse: async (_, args, context) => {
      loginCheck(context);

      const student = await Student.findById(context.user.id);
      if (!student) throw Error("you must be a student to join a course");

      const { courseId } = args;

      const courseStudent = await CourseStudent.find({
        course: courseId,
        student: student.id,
      });
      if (courseStudent.length) throw Error("already in course");

      const course = await Course.findById(courseId);
      if (!course) throw Error("course doesn't exist");

      const newCourseStudent = new CourseStudent({
        student: student.id,
        course: courseId,
      });
      await newCourseStudent.save();

      return {
        course: course,
        student: student,
      };
    },
  },
};
