const { MongoClient } = require("mongodb");
const { Mutation } = require("../resolvers/courseResolvers");
const accountsGraphQL = require("../accounts.js");
const { accountsPassword } = accountsGraphQL;
const { User, Teacher, Course } = require("../models");

const { ApolloServer, gql } = require("apollo-server-lambda");

const typeDefs = require("../typeDefs/index.js");
const resolvers = require("../resolvers/index.js");

jest.useFakeTimers();

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

const QUERY = gql`
  query {
    getCurrentUser {
      id
      firstName
    }
  }
`;

describe("insert", () => {
  let server;
  let token;

  beforeAll(async () => {
    //await accountsPassword.createUser({ email: "user@email.com", password: "qwerty" });

    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async () => {
        return await accountsGraphQL.context({
          req: { headers: { authorization: token } },
        });
      },
      credentials: true,
    });

    // const { data } = await server.executeOperation({
    //   query: AUTHENTICATE,
    //   variables: {
    //     email: "user@email.com",
    //     password: "qwerty",
    //   },
    // });

    // console.log(data);
  });

  it("should", async () => {
    const result = await server.executeOperation({
      query: QUERY,
    });
    console.log(result);
  });

  // it("should not allow a non-teacher to create a course", async () => {
  //   const userId = await accountsPassword.createUser({ email: "notteacher@email.com", password: "qwerty" });
  //   const user = await User.findById(userId);

  //   await expect(async () => await Mutation.createCourse(null, null, { user })).rejects.toThrow();
  // });

  it("should insert a new Course", async () => {
    const userId = await accountsPassword.createUser({ email: "teacher@email.com", password: "qwerty" });
    const user = await User.findById(userId);
    await new Teacher({ _id: userId, user: userId }).save();
    await Mutation.createCourse(null, { name: "Test Course" }, { user });

    const createdCourse = await Course.find({ name: "Test Course" });

    expect(createdCourse).toBeTruthy();
  });
});
