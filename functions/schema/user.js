const { gql, AuthenticationError } = require("apollo-server-lambda");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");

const User = require("../models/user.js");
const Course = require("../models/course.js");

exports.typeDef = gql`
  extend type Query {
    users(pagination: PaginationInput): UsersResult
  }

  extend type Mutation {
    createUploadPreset: User
  }

  extend type User {
    isTeacher: Boolean
    courses: CoursesResult
    uploadPreset: String
  }

  type UsersResult {
    data: [User]
    pagination: Pagination
  }

  extend type CreateUserInput {
    username: String!
    email: String!
    password: String!
  }
`;

exports.resolvers = {
  User: {
    courses: async (user) => {
      const filter = {
        _id: {
          $in: user.courses?.map((id) => mongoose.Types.ObjectId(id)) ?? [],
        },
      };

      return {
        data: await Course.find(filter),
        pagination: null,
      };
    },
  },

  Query: {
    users: async (_, args) => {
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
      if (!context.user) throw new AuthenticationError("you must be logged in");
      if (context.user.uploadPreset)
        throw new Error("already has upload preset");

      const { username, id } = context.user;
      const folder = `${username}_${id}`;

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
