const { gql, AuthenticationError } = require("apollo-server-lambda");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

const accountsGraphQL = require("../accounts.js");
const { typeDef: User, resolvers: userResolvers } = require("./User.js");
const { typeDef: Course, resolvers: courseResolvers } = require("./Course.js");

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
};

// A new schema is created combining our schema and the accounts-js schema
const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([User, Course, typeDefs, accountsGraphQL.typeDefs]),
  resolvers: mergeResolvers([
    accountsGraphQL.resolvers,
    resolvers,
    userResolvers,
    courseResolvers,
  ]),
  schemaDirectives: {
    ...accountsGraphQL.schemaDirectives,
  },
});

module.exports = schema;
