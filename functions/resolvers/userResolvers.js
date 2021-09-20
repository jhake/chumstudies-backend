const cloudinary = require("cloudinary");

const { accountsPassword } = require("../accounts.js");
const { User, Student, Teacher } = require("../models/index.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  User: {
    uploadPreset: (user, _, context) => {
      if (context.user.id !== user.id) throw Error("can't query other's upload preset");
      return user.uploadPreset;
    },
    schoolIdNumber: (user, _, context) => {
      if (context.user.id !== user.id) throw Error("can't query other's school id number");
      return user.schoolIdNumber;
    },
    student: async (user) => await Student.findById(user.id),
    teacher: async (user) => await Teacher.findById(user.id),
  },

  Query: {
    getCurrentUser: async (_, __, context) => {
      loginCheck(context);

      return await User.findById(context.user.id);
    },
    users: async (_, args, context) => {
      loginCheck(context);
      if (!context.user.isAdmin) throw Error("must be an admin to query users");

      const limit = args?.pagination?.limit ?? 30;
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
    createAdmin: async (_, args, context) => {
      loginCheck(context);
      if (!context.user.isAdmin) throw Error("must be an admin");

      // create user
      const userId = await accountsPassword.createUser({
        ...args,
        isAdmin: true,
      });

      // create upload preset
      const user = await User.findById(userId);
      const { lastName, id } = user;
      const folder = `${process.env.CLOUDINARY_FOLDER}/${lastName}_${id}`;

      const presetResult = await cloudinary.v2.api.create_upload_preset({
        unsigned: true,
        folder,
      });
      const presetName = presetResult.name;
      user.uploadPreset = presetName;

      return await user.save();
    },
    adminCreateUser: async (_, args, context) => {
      loginCheck(context);
      if (!context.user.isAdmin) throw Error("must be an admin");

      const { isTeacher } = args;

      // create user
      const userId = await accountsPassword.createUser({
        ...args,
        isAdmin: false,
      });

      // create teacher or student entity
      if (isTeacher) {
        const teacher = new Teacher({ _id: userId, user: userId });
        await teacher.save();
      } else {
        const student = new Student({ _id: userId, user: userId });
        await student.save();
      }

      // create upload preset
      const user = await User.findById(userId);
      const { lastName, id } = user;
      const folder = `${process.env.CLOUDINARY_FOLDER}/${lastName}_${id}`;

      const presetResult = await cloudinary.v2.api.create_upload_preset({
        unsigned: true,
        folder,
      });
      const presetName = presetResult.name;
      user.uploadPreset = presetName;

      return await user.save();
    },
  },
};
