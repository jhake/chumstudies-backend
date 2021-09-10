const mongoose = require("mongoose");
const cloudinary = require("cloudinary");

const User = require("../models/user.js");
const Student = require("../models/student.js");
const Teacher = require("../models/teacher.js");
const Course = require("../models/course.js");
const CourseStudent = require("../models/courseStudent.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  User: {
    // courses: async (user) => {
    //   const userCourses = await UserCourse.find({ user: user.id });

    //   const filter = {
    //     _id: {
    //       $in:
    //         userCourses?.map(({ course }) => mongoose.Types.ObjectId(course)) ??
    //         [],
    //     },
    //   };

    //   return {
    //     data: await Course.find(filter),
    //     pagination: null,
    //   };
    // },
    private: (user, _, context) => {
      if (context.user.id !== user.id)
        throw Error("can't query other's private data");

      return user;
    },
    student: async (user) => await Student.findById(user.id),
    teacher: async (user) => await Teacher.findById(user.id),
  },

  Query: {
    users: async (_, args, context) => {
      loginCheck(context);

      const limit = args?.pagination?.limit ?? 10;
      const page = args?.pagination?.page ?? 1;
      const skip = limit * (page - 1);

      const filter = {};

      const totalCount = await User.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: await User.find(filter).skip(skip).limit(limit),
        pagination: {
          totalCount,
          totalPages,
        },
      };
    },
  },

  Mutation: {
    createUploadPreset: async (_, __, context) => {
      loginCheck(context);
      if (context.user.uploadPreset) throw Error("already has upload preset");

      const { lastName, id } = context.user;
      const folder = `${process.env.CLOUDINARY_FOLDER}/${lastName}_${id}`;

      const presetResult = await cloudinary.v2.api.create_upload_preset({
        unsigned: true,
        folder,
      });
      const presetName = presetResult.name;

      const user = await User.findById(context.user.id);
      user.uploadPreset = presetName;

      return await user.save();
    },
    createStudent: async (_, __, context) => {
      loginCheck(context);
      const student = new Student({
        _id: context.user.id,
        user: context.user.id,
      });
      return await student.save();
    },
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
