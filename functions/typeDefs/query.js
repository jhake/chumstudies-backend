const { gql } = require("apollo-server-lambda");

module.exports = gql`
  extend type Query {
    hello: String
    mongoLatency: Float
  }

  # User
  extend type Query {
    getCurrentUser: User
    users(pagination: PaginationInput, filter: UsersFilter): UsersResult
    usersCount: UsersCountResult
  }

  input UsersFilter {
    search: String
  }

  type UsersCountResult {
    usersCount: Int
    studentsCount: Int
    teachersCount: Int
  }

  # Course
  extend type Query {
    course(courseId: ID!): Course
    courseFromCourseCode(courseCode: String!): Course
    courses(pagination: PaginationInput): CoursesResult
    studentCourses: CoursesResult
    teacherCourses: CoursesResult
    studentsWithoutGroup(courseId: ID!): StudentsResult
  }

  # Post
  extend type Query {
    groupPosts(groupId: ID!, tags: [String]): PostsResult
    groupPostTags(groupId: ID!): [Tag]
    coursePosts(courseId: ID!): PostsResult
  }

  type Tag {
    name: String
    count: Int
  }

  # File
  extend type Query {
    studyGroupFiles(groupId: ID!): GroupFilesResult
    courseFiles(courseId: ID!): CourseFilesResult
  }

  type GroupFilesResult {
    postFiles: [File]
    groupActivityFiles: [File]
  }

  type CourseFilesResult {
    postFiles: [File]
    activityFiles: [File]
    groupActivityFiles: [File]
  }

  # Comment
  extend type Query {
    postComments(postId: ID!): CommentsResult
  }

  # Group
  extend type Query {
    group(groupId: ID!): Group
    groups(pagination: PaginationInput): GroupsResult
    groupFromGroupCode(groupCode: String!): Group
    studentClassGroups(pagination: PaginationInput): GroupsResult
    studentStudyGroups(pagination: PaginationInput): GroupsResult
    teacherClassGroups(pagination: PaginationInput): GroupsResult
  }

  # Feed
  extend type Query {
    studentLeftSidePanel: StudentLeftSidePanelResult
    studentHomeFeed: PostsResult
    teacherHomeFeed: PostsResult
  }

  type StudentLeftSidePanelResult {
    courses: [Course]
    studyGroups: [Group]
    classGroups: [Group]
  }

  # Activity
  extend type Query {
    activity(activityId: ID!): Activity
    groupActivity(groupActivityId: ID!): GroupActivity
    courseActivities(courseId: ID!): ActivitiesResult
    courseGroupActivities(courseId: ID!): GroupActivitiesResult
  }
`;
