const cloudinary = require("cloudinary");

const { User, Student, Teacher } = require("../models/index.js");
const { loginCheck } = require("../utils/checks.js");

module.exports = {
  User: {
    private: (user, _, context) => {
      if (context.user.id !== user.id) throw Error("can't query other's private data");

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
  },
};
