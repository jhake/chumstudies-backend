const { gql } = require("apollo-server-lambda");
const { GraphQLError } = require("graphql");

const accountsGraphQL = require("../accounts.js");
const { accountsPassword } = accountsGraphQL;

const { Teacher, Course } = require("../models");

const CREATE_COURSE = gql`
  mutation createCourse(
    $name: String!
    $subjCode: String!
    $yearAndSection: String!
    $startsAt: Date!
    $endsAt: Date!
  ) {
    createCourse(
      name: $name
      subjCode: $subjCode
      yearAndSection: $yearAndSection
      startsAt: $startsAt
      endsAt: $endsAt
    ) {
      id
      name
      subjCode
      yearAndSection
      startsAt
      endsAt
      teacher {
        id
      }
    }
  }
`;

const courseFixture = {
  name: "Test Course",
  subjCode: "code12345",
  yearAndSection: "1-1",
  startsAt: Date.now(),
  endsAt: Date.now(),
};

describe("create course", () => {
  it("should not allow a non-teacher to create a course", async () => {
    await accountsPassword.createUser({ email: "notteacher@email.com", password: "qwerty" });
    await global.login("notteacher@email.com", "qwerty");

    const { errors } = await global.server.executeOperation({
      query: CREATE_COURSE,
      variables: { ...courseFixture },
    });

    expect(errors[0]).toMatchObject(new GraphQLError("you must be a teacher to create a course"));
  });

  it("should insert a new Course", async () => {
    const userId = await accountsPassword.createUser({ email: "teacher@email.com", password: "qwerty" });
    await new Teacher({ _id: userId, user: userId }).save();
    await global.login("teacher@email.com", "qwerty");

    const { errors, data } = await global.server.executeOperation({
      query: CREATE_COURSE,
      variables: { ...courseFixture },
    });

    expect(errors).toBeFalsy();
    const createdCourse = await Course.findById(data.createCourse.id);

    for (const [key, value] of Object.entries(courseFixture)) {
      if (["startsAt", "endsAt"].includes(key)) {
        expect(new Date(data.createCourse[key])).toMatchObject(new Date(value));
        expect(new Date(createdCourse[key])).toMatchObject(new Date(value));
        continue;
      }

      expect(data.createCourse[key]).toBe(value);
      expect(createdCourse[key]).toBe(value);
    }

    expect(data.createCourse.teacher.id).toBe(userId);
    expect(createdCourse.teacher == userId).toBe(true);
  });
});
