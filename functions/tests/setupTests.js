const { ApolloServer, gql } = require("apollo-server-lambda");
const typeDefs = require("../typeDefs/index.js");
const resolvers = require("../resolvers/index.js");
const accountsGraphQL = require("../accounts.js");
const { accountsPassword, mongoConnection } = accountsGraphQL;

beforeAll(() => {});
afterAll(() => {
  mongoConnection.close();
});

global.server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => {
    return await accountsGraphQL.context({
      req: { headers: { authorization: global.token } },
    });
  },
  credentials: true,
});

const AUTHENTICATE = gql`
  mutation authenticate($email: String!, $password: String!) {
    authenticate(serviceName: "password", params: { user: { email: $email }, password: $password }) {
      sessionId
      tokens {
        accessToken
        refreshToken
      }
    }
  }
`;

global.accountsPassword = accountsPassword;
global.login = async (email, password) => {
  const { data } = await global.server.executeOperation({
    query: AUTHENTICATE,
    variables: {
      email,
      password,
    },
  });

  global.token = data.authenticate.tokens.accessToken;
};
