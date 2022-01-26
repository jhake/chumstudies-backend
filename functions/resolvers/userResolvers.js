const cloudinary = require("cloudinary");

const { accountsPassword } = require("../accounts.js");
const { User, Student, Teacher } = require("../models/index.js");
const { loginCheck } = require("../utils/checks.js");
const { destroyFile, validateFile } = require("../utils/cloudinary.js");
const generateRandomString = require("../utils/generateRandomString.js");

module.exports = {
  User: {
    uploadPreset: (user, _, context) => {
      if (context.user.id !== user.id) throw Error("can't query other's upload preset");
      return user.uploadPreset;
    },
    schoolIdNumber: (user, _, context) => {
      if (context.user.id !== user.id && !context.user.isAdmin) throw Error("can't query other's school id number");
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
    users: async (_, { pagination, filter: filterInput }, context) => {
      loginCheck(context);
      if (!context.user.isAdmin) throw Error("must be an admin to query users");

      const limit = pagination?.limit ?? 30;
      const page = pagination?.page ?? 1;
      const skip = limit * (page - 1);

      const { search } = filterInput ?? {};

      const filter = {
        $and: [
          ...(search
            ? [
                {
                  $text: {
                    $search: search,
                  },
                },
              ]
            : []),
          {},
        ],
      };

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
    usersCount: async (_, __, context) => {
      loginCheck(context);
      if (!context.user.isAdmin) throw Error("must be an admin to query users");

      return {
        usersCount: await User.countDocuments({}),
        teachersCount: await Teacher.countDocuments({}),
        studentsCount: await Student.countDocuments({}),
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

      const password = generateRandomString(12);

      // create user
      const userId = await accountsPassword.createUser({
        ...args,
        password,
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

      await accountsPassword.sendEnrollmentEmail(args.email);

      return await user.save();
    },
    adminCreateUser: async (_, args, context) => {
      loginCheck(context);
      if (!context.user.isAdmin) throw Error("must be an admin");

      const { isTeacher } = args;

      const password = generateRandomString(12);

      // create user
      const userId = await accountsPassword.createUser({
        ...args,
        password,
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

      await accountsPassword.sendEnrollmentEmail(args.email);

      return await user.save();
    },

    changeProfilePicture: async (_, { profilePicture }, context) => {
      loginCheck(context);

      const user = context.user;

      const cloudinaryObject = JSON.parse(profilePicture);
      if (!cloudinaryObject.public_id.includes(`User_${user.id}`)) throw Error("public_id not valid profile picture");
      if (user.profilePicture) {
        await destroyFile(user.profilePicture);
      }

      await validateFile(profilePicture);
      return await User.findByIdAndUpdate(user.id, { profilePicture }, { new: true });
    },

    editUserInfo: async (_, args, context) => {
      loginCheck(context);

      const user = context.user;

      return await User.findByIdAndUpdate(
        user.id,
        {
          firstName: args.firstName,
          middleName: args.middleName,
          lastName: args.lastName,
          "emails.0.address": args.email,
        },
        { new: true }
      );
    },
    adminEditUserInfo: async (_, args, context) => {
      loginCheck(context);
      if (!context.user.isAdmin) throw Error("must be an admin");


      return await User.findByIdAndUpdate(
        args.id,
        {
          firstName: args.firstName,
          middleName: args.middleName,
          lastName: args.lastName,
          "emails.0.address": args.email,
        },
        { new: true }
      );
    },
  },
};
