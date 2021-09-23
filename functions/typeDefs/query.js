const { gql } = require("apollo-server-lambda");

module.exports = gql`
  extend type Query {
    hello: String
    mongoLatency: Float
  }

  extend type Query {
    getCurrentUser: User
    users(pagination: PaginationInput): UsersResult
  }

  # Course
  extend type Query {
    course(courseId: ID!): Course
    courses(pagination: PaginationInput): CoursesResult
    studentCourses: CoursesData
  }

  # Group
  extend type Query {
    group(groupId: ID!): Group
    groups(pagination: PaginationInput): GroupsResult
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
