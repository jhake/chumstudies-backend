const { AccountsModule } = require("@accounts/graphql-api");
const mongoose = require("mongoose");
const { Mongo } = require("@accounts/mongo");
const { AccountsServer } = require("@accounts/server");
const { AccountsPassword } = require("@accounts/password");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary");

// Initiate nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// We connect mongoose to our local mongodb database
mongoose.connect(`${process.env.MONGODB_CONNECTION}${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We tell accounts-js to use the mongo connection
const accountsMongo = new Mongo(mongoose.connection);

const accountsPassword = new AccountsPassword({
  // This option is called when a new user create an account
  // Inside we can apply our logic to validate the user fields
  validateNewUser: (user) => {
    return { ...user, isAdmin: false };
  },

  twoFactor: {
    // Will be the two factor name displayed to the user
    appName: "Chumstudies",
  },

  notifyUserAfterPasswordChanged: false,
});

const accountsServer = new AccountsServer(
  {
    emailTemplates: {
      from: "Chumstudies",
      verifyEmail: {
        subject: (user) => `Chumstudies - Verify your account email ${user.firstName} ${user.lastName}`,
        html: (_, url) => `To verify your account email please click on this link: ${url}`,
      },
      resetPassword: {
        subject: (user) => `Chumstudies - Reset your password ${user.firstName} ${user.lastName}`,
        html: (_, url) => `To reset your password please click on this link: ${url}`,
      },
      enrollAccount: {
        subject: (user) => {
          console.log("ASDSA");
          return `Welcome to Chumstudies, ${user.firstName} ${user.lastName}!`;
        },
        html: (_, url) => `Set your password by clicking this link: ${url.replace("enroll-account", "reset-password")}`,
      },
    },
    sendMail: async ({ from, subject, to, text, html }) => {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    },
    siteUrl: process.env.FRONTEND_URL,
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
accountsGraphQL.accountsPassword = accountsPassword;
accountsGraphQL.mongoConnection = mongoose.connection;

module.exports = accountsGraphQL;
