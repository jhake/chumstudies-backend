const { ApolloServer } = require("apollo-server-lambda");
// const accountsGraphQL = require("./accounts.js");
const schema = require("./schema/index.js");

const server = new ApolloServer({
  typeDefs: schema.typeDefs,
  resolvers: schema.resolvers,
  context: null,
  introspection: true,
  playground: true,
});

const handler = server.createHandler();

module.exports = { handler };
