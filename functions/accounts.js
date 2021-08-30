const { AccountsModule } = require("@accounts/graphql-api");
const mongoose = require("mongoose");
const { Mongo } = require("@accounts/mongo");
const { AccountsServer } = require("@accounts/server");
const { AccountsPassword } = require("@accounts/password");

// We connect mongoose to our local mongodb database
mongoose.connect(process.env.MONGODB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We tell accounts-js to use the mongo connection
const accountsMongo = new Mongo(mongoose.connection);

const accountsPassword = new AccountsPassword({
  // This option is called when a new user create an account
  // Inside we can apply our logic to validate the user fields
  validateNewUser: (user) => {
    return { ...user, isTeacher: false };
  },
});

const accountsServer = new AccountsServer(
  {
    ambiguousErrorMessages: false,
    enableAutologin: true,
    // We link the mongo adapter to the server
    db: accountsMongo,
    // Replace this value with a strong random secret
    tokenSecret: process.env.TOKEN_SECRET,
  },
  {
    // We pass a list of services to the server, in this example we just use the password service
    password: accountsPassword,
  }
);

// We generate the accounts-js GraphQL module
const accountsGraphQL = AccountsModule.forRoot({ accountsServer });

module.exports = accountsGraphQL;
