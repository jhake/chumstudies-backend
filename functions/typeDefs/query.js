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
    courses(pagination: PaginationInput): CoursesResult
    studentCourses: CoursesResult
    teacherCourses: CoursesResult
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

  # Comment
  extend type Query {
    postComments(postId: ID!): CommentsResult
  }

  # Group
  extend type Query {
    group(groupId: ID!): Group
    groups(pagination: PaginationInput): GroupsResult
    studentClassGroups(pagination: PaginationInput): GroupsResult
    studentStudyGroups(pagination: PaginationInput): GroupsResult
  }

  # Feed
  extend type Query {
    studentLeftSidePanel: StudentLeftSidePanelResult
    studentHomeFeed: StudentHomeFeedResult
  }

  type StudentLeftSidePanelResult {
    courses: [Course]
    studyGroups: [Group]
    classGroups: [Group]
  }

  type StudentHomeFeedResult {
    items: [FeedItem]
  }

  type FeedItem {
    post: Post
    activity: Activity
    groupActivity: GroupActivity
  }
`;
