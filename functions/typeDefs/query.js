const { gql } = require("apollo-server-lambda");

module.exports = gql`
  extend type Query {
    hello: String
  }

  extend type Query {
    users(pagination: PaginationInput): UsersResult
  }

  extend type Query {
    courses(pagination: PaginationInput): CoursesResult
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
