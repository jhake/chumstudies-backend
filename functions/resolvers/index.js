const { mergeResolvers } = require("@graphql-tools/merge");
const { GraphQLScalarType, Kind } = require("graphql");

const accountsGraphQL = require("../accounts.js");
const { loginCheck } = require("../utils/checks.js");

const resolvers = [
  require("./courseResolvers.js"),
  require("./postResolvers.js"),
  require("./userResolvers.js"),
  require("./studentResolvers.js"),
  require("./teacherResolvers.js"),
  require("./feedResolvers.js"),
  require("./groupResolvers.js"),
];

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return new Date(value).toJSON(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

const otherResolvers = {
  Query: {
    hello: (_, __, context) => {
      loginCheck(context);

      return "Hello World";
    },
  },
  Mutation: {
    impersonate: () => {
      throw Error("This mutation is disabled");
    },
    addEmail: () => {
      throw Error("This mutation is disabled");
    },
    createUser: () => {
      throw Error("This mutation is disabled");
    },
  },
  Date: dateScalar,
};

module.exports = mergeResolvers([accountsGraphQL.resolvers, otherResolvers, ...resolvers]);
