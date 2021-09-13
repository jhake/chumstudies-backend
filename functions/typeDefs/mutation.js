const { gql } = require("apollo-server-lambda");

module.exports = gql`
  # User
  extend type Mutation {
    createUploadPreset: User
    adminCreateUser(input: AdminCreateUserInput): User
    createAdmin(input: CreateAdminInput): User
  }

  extend type CreateUserInput {
    firstName: String!
    middleName: String
    lastName: String!
    schoolIdNumber: String!
    email: String!
    password: String!
  }

  input AdminCreateUserInput {
    firstName: String!
    middleName: String
    lastName: String!
    schoolIdNumber: String!
    email: String!
    password: String!
    isTeacher: Boolean!
  }

  input CreateAdminInput {
    firstName: String!
    middleName: String
    lastName: String!
    email: String!
    password: String!
  }

  # Course
  extend type Mutation {
    createCourse(input: CreateCourseInput!): Course
    joinCourse(courseCode: String!): Course
  }

  input CreateCourseInput {
    name: String!
    subjCode: String!
    yearAndSection: String!
    startsAt: Date!
    endsAt: Date!
  }

  # Group
  extend type Mutation {
    createClassGroup(input: CreateClassGroupInput!): Group
    assignStudentsToClassGroup(input: AssignStudentsToClassGroupInput!): Group
  }

  input CreateClassGroupInput {
    name: String!
    courseId: ID!
  }

  input AssignStudentsToClassGroupInput {
    groupId: ID!
    studentIds: [ID!]!
  }

  # Post
  extend type Mutation {
    createPost(input: CreatePostInput!): Post
    addAttachmentToPost(id: ID!, attachment: String!): Post
    destroyPost(id: ID!): Boolean
  }

  input CreatePostInput {
    groupId: ID
    courseId: ID
    content: String!
    category: String
    tags: [String]
  }
`;
