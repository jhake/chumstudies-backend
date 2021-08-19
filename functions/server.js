const { ApolloServer } = require("apollo-server-lambda");
const { ApolloServer: ApolloServerLambda } = require("apollo-server-lambda");
const accountsGraphQL = require("./accounts.js");
const schema = require("./schema/index.js");

exports.createLocalServer = () =>
  new ApolloServer({
    schema,
    context: accountsGraphQL.context,
    introspection: true,
    playground: true,
  });

exports.createLambdaServer = () =>
  new ApolloServerLambda({
    schema,
    context: accountsGraphQL.context,
    introspection: true,
    playground: true,
  });
