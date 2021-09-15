const { gql } = require("apollo-server-lambda");

module.exports = gql`
  extend type Query {
    hello: String
  }

  extend type Query {
    users(pagination: PaginationInput): UsersResult
  }

  # Course
  extend type Query {
    courses(pagination: PaginationInput): CoursesResult
  }

  # Group
  extend type Query {
    groups(pagination: PaginationInput): GroupsResult
  }
  # Feed
  extend type Query {
    studentHomeFeed: StudentHomeFeedResult
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
