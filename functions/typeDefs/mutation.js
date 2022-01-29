const { gql } = require("apollo-server-lambda");

module.exports = gql`
  # User
  extend type Mutation {
    createUploadPreset: User
    adminCreateUser(
      firstName: String!
      middleName: String
      lastName: String!
      schoolIdNumber: String!
      yearLevel: String!
      courseDept: String!
      section: Int!

      email: String!
      isTeacher: Boolean!
    ): User
    createAdmin(firstName: String!, middleName: String, lastName: String!, email: String!): User
    editUserInfo(firstName: String, middleName: String, lastName: String, email: String): User
    adminEditUserInfo(
      id: ID!
      firstName: String
      middleName: String
      lastName: String
      courseDept: String
      yearLevel: String
      section: Int
      schoolIdNumber: String
      email: String
    ): User
    changeProfilePicture(profilePicture: String!): User
  }

  extend type CreateUserInput { ## should not be used since admin will create the users
    firstName: String!
    middleName: String
    lastName: String!
    schoolIdNumber: String!
    courseDept: String!
    yearLevel: String!
    section: Int
    email: String!
    password: String!
  }

  # Course
  extend type Mutation {
    createCourse(name: String!, subjCode: String!, yearAndSection: String!, startsAt: Date!, endsAt: Date!): Course
    editCourseInfo(
      courseId: ID!
      name: String
      subjCode: String
      yearAndSection: String
      startsAt: Date
      endsAt: Date
      isActive: Boolean
    ): Course
    joinCourse(courseCode: String!): Course
  }

  # Group
  extend type Mutation {
    createClassGroup(courseId: ID!, studentIds: [ID!]!): Group
    becomeLeader(groupId: ID!): Group
    transferLeadership(groupId: ID!, studentId: ID!): Group
    createStudyGroup(name: String!): Group
    joinStudyGroup(groupCode: String!): Group
  }

  # Activity / GroupActivity
  extend type Mutation {
    createActivity(title: String!, description: String!, dueAt: Date!, courseId: ID!, points: Int!): Activity
    addAttachmentToActivity(id: ID!, attachment: String!): Activity
    createGroupActivity(title: String!, description: String!, dueAt: Date!, courseId: ID!, points: Int!): GroupActivity
    addAttachmentToGroupActivity(id: ID!, attachment: String!): GroupActivity
  }

  # Submission / GroupSubmission
  extend type Mutation {
    createSubmission(description: String!, activityId: ID!): Submission
    addAttachmentToSubmission(id: ID!, attachment: String!): Submission
    submitSubmission(id: ID!): Submission
    gradeSubmission(submissionId: ID!, grade: Int!): Submission

    createGroupSubmission(groupActivityId: ID!): GroupSubmission
    submitGroupSubmission(groupSubmissionId: ID!, description: String!, attachment: String): GroupSubmission
    gradeGroupSubmission(groupSubmissionId: ID!, grade: Int!): GroupSubmission
  }

  # Post
  extend type Mutation {
    createPost(groupId: ID, courseId: ID, content: String!, category: String, tags: [String]): Post
    addAttachmentToPost(id: ID!, attachment: String!): Post
    destroyPost(id: ID!): Boolean
  }

  # Comment
  extend type Mutation {
    createPostComment(postId: ID!, content: String!): Comment
    voteComment(commentId: ID!, vote: Int!): Comment
  }

  # Task
  extend type Mutation {
    createTask(groupSubmissionId: ID!, studentId: ID!, title: String!, note: String!, dueAt: Date!): Task
    changeTaskStatus(taskId: ID!, status: TaskStatus!): Task
    submitTask(taskId: ID!, attachment: String, description: String!): Task
  }
`;
