const { ApolloServer } = require("apollo-server-lambda");
const accountsGraphQL = require("./accounts.js");
const schema = require("./schema/index.js");

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
