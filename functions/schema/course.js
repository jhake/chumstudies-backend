const { gql } = require("apollo-server-lambda");
const mongoose = require("mongoose");

const Course = require("../models/course.js");
const User = require("../models/user.js");
const UserCourse = require("../models/userCourse.js");
const { loginCheck } = require("../utils/checks.js");

exports.typeDef = gql`
  extend type Query {
    courses(pagination: PaginationInput): CoursesResult
  }

  extend type Mutation {
    createCourse(course: CreateCourseInput!): Course
    joinCourse(input: JoinCourseInput): joinCourseResult
  }

  type Course {
    id: ID
    name: String
    attendees: UsersResult
  }

  type CoursesResult {
    data: [Course]
    pagination: Pagination
  }

  input CreateCourseInput {
    name: String!
  }

  input JoinCourseInput {
    courseId: String!
  }

  type joinCourseResult {
    course: Course
    user: User
  }
`;

exports.resolvers = {
  Course: {
    attendees: async (course) => {
      const userCourses = await UserCourse.find({ course: course.id });

      const filter = {
        _id: {
          $in:
            userCourses?.map(({ user }) => mongoose.Types.ObjectId(user)) ?? [],
        },
      };
      return {
        data: await User.find(filter),
        pagination: null,
      };
    },
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
      // if (!context.user.isTeacher)
      //   throw Error("you must be a teacher to create a course");

      const course = new Course({ name: args.course.name });
      return await course.save();
    },

    joinCourse: async (_, args, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const courseId = args.input.courseId;

      const userCourse = await UserCourse.find({
        user: userId,
        course: courseId,
      });
      if (userCourse.length) throw Error("already in course");

      const course = await Course.findById(courseId);
      if (!course) throw Error("course doesn't exist");

      const newUserCourse = new UserCourse({
        user: context.user.id,
        course: args.input.courseId,
      });
      await newUserCourse.save();

      return {
        course: course,
        user: context.user,
      };
    },
  },
};
