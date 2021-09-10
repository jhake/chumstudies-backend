const { gql } = require("apollo-server-lambda");

module.exports = gql`
  # User
  extend type Mutation {
    createUploadPreset: User
    createStudent: Student #Temporary
    createTeacher: Teacher #Temporary
  }

  extend type CreateUserInput {
    firstName: String!
    middleName: String
    lastName: String!
    schoolIdNumber: String!
    email: String!
    password: String!
  }

  # Course
  extend type Mutation {
    createCourse(input: CreateCourseInput!): Course
    joinCourse(input: JoinCourseInput): JoinCourseResult
  }

  input CreateCourseInput {
    name: String!
    subjCode: String!
    yearAndSection: String!
    startsAt: Date!
    endsAt: Date!
  }

  input JoinCourseInput {
    courseId: String!
  }

  type JoinCourseResult {
    course: Course
    user: User
  }

  # Post
  extend type Mutation {
    createPost(input: CreatePostInput!): Post
    addAttachmentToPost(id: ID!, attachment: String!): Post
    destroyPost(id: ID!): Boolean
  }

  input CreatePostInput {
    content: String!
    category: String
    tags: [String]
  }
`;
