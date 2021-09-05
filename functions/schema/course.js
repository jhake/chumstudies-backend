const { gql } = require("apollo-server-lambda");
const mongoose = require("mongoose");

const Course = require("../models/course.js");
const User = require("../models/user.js");
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
      const filter = {
        _id: {
          $in: course.attendees?.map((id) => mongoose.Types.ObjectId(id)) ?? [],
        },
      };

      return {
        data: await User.find(filter),
        pagination: null,
      };
    },
  },

  Query: {
    courses: async (_, args) => {
      loginCheck();
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

      const course = await Course.findById({
        _id: courseId,
      });
      if (Array.isArray(course.attendees) && course.attendees.length) {
        if (course.attendees.includes(userId)) throw Error("already in course");

        course.attendees.push(userId);
      } else {
        course.attendees = [userId];
      }

      const user = await User.findById({
        _id: userId,
      });
      if (Array.isArray(user.courses) && user.courses.length) {
        user.courses.push(courseId);
      } else {
        user.courses = [courseId];
      }
      return {
        course: await course.save(),
        user: await user.save(),
      };
    },
  },
};
