const { ApolloServer } = require("apollo-server-lambda");
require("dotenv").config();

const typeDefs = require("./typeDefs/index.js");
const resolvers = require("./resolvers/index.js");
const accountsGraphQL = require("./accounts.js");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ event }) => {
    return await accountsGraphQL.context({
      req: { headers: { authorization: event.headers.authorization } },
    });
  },
  introspection: true,
  playground: true,
  origin: process.env.FRONTEND_URL,
  credentials: true,
});

const handler = server.createHandler({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

if (process.env.GITHUB_ACTION) console.log("no errors");
module.exports = { handler };
