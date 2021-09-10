const { ApolloServer } = require("apollo-server-lambda");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const typeDefs = require("./typeDefs/index.js");
const resolvers = require("./resolvers/index.js");
const accountsGraphQL = require("./accounts.js");

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    ...accountsGraphQL.schemaDirectives,
  },
});

const server = new ApolloServer({
  schema,
  context: async ({ event }) => {
    return await accountsGraphQL.context({
      req: { headers: { authorization: event.headers.authorization } },
    });
  },
  introspection: true,
  playground: true,
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true,
});

const handler = server.createHandler({
  cors: {
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true,
  },
});

module.exports = { handler };
