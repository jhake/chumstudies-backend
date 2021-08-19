const { gql } = require("apollo-server-lambda");
const mongoose = require("mongoose");

const User = require("../models/User.js");
const Course = require("../models/Course.js");

exports.typeDef = gql`
  extend type Query {
    users(pagination: PaginationInput): UsersResult
  }

  type User {
    isTeacher: Boolean
    courses: CoursesResult
  }

  type UsersResult {
    data: [User]
    pagination: Pagination
  }

  type CreateUserInput {
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
};
