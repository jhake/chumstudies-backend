const { AuthenticationError } = require("apollo-server-lambda");

module.exports.loginCheck = (context) => {
  if (!context.user) throw new AuthenticationError("you must be logged in");
};
