const { ApolloServer } = require("apollo-server-lambda");
const accountsGraphQL = require("./accounts.js");
const schema = require("./schema/index.js");

const server = new ApolloServer({
  schema,
  context: accountsGraphQL.context,
  introspection: true,
  playground: true,
});

const handler = server.createHandler();

module.exports = { handler };
