const { mergeTypeDefs } = require("@graphql-tools/merge");

const accountsGraphQL = require("../accounts.js");
const types = require("./types.js");
const query = require("./query.js");
const mutation = require("./mutation.js");

module.exports = mergeTypeDefs([types, query, mutation, accountsGraphQL.typeDefs]);
