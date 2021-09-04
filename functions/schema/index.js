const { gql, AuthenticationError } = require("apollo-server-lambda");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

const accountsGraphQL = require("../accounts.js");
const { typeDef: User, resolvers: userResolvers } = require("./user.js");
const { typeDef: Course, resolvers: courseResolvers } = require("./course.js");
const { typeDef: Post, resolvers: postResolvers } = require("./post.js");

const typeDefs = gql`
  type Query {
    sensitiveInformation: String
  }

  type Pagination {
    totalCount: Int
    totalPages: Int
  }

  input PaginationInput {
    page: Int
    limit: Int
  }
`;

const resolvers = {
  Query: {
    sensitiveInformation: (_, __, context) => {
      if (!context.user) throw new AuthenticationError("you must be logged in");

      return "Sensitive info";
    },
  },
  Mutation: {
    impersonate: () => {
      throw new Error("This mutation is disabled");
    },
    addEmail: () => {
      throw new Error("This mutation is disabled");
    },
  },
};

// A new schema is created combining our schema and the accounts-js schema
const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([
    User,
    Course,
    Post,
    typeDefs,
    accountsGraphQL.typeDefs,
  ]),
  resolvers: mergeResolvers([
    accountsGraphQL.resolvers,
    resolvers,
    userResolvers,
    courseResolvers,
    postResolvers,
  ]),
  schemaDirectives: {
    ...accountsGraphQL.schemaDirectives,
  },
});

module.exports = schema;
