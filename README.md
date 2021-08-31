# Chumstudies Backend

This is a serverless implementation of the backend service for [Chumstudies](https://chumstudies.netlify.app/).

Notable libraries used.

- [apollo-server-lambda](https://www.npmjs.com/package/apollo-server-lambda)
- [accounts-js](https://www.accountsjs.com/)
- [mongoose](https://mongoosejs.com/)

# Setup local development

## Prerequisites

- Node 14 or later
- MongoDB database

## Install Netlify CLI globally

```console
$ npm install netlify-cli -g
```

## Install node modules

Go to the functions folder then run `npm install`

```console
$ cd functions
$ npm install
```

## Set environment variables

Create the environment file (`.env`) on the root directory. The required variables are in the `.env-example` file provided.

If you came from installing node modules, cd back to the root.

```console
$ cd ../
```

Create `.env` file

```console
$ touch .env
```

The file should look like this

```
MONGODB_CONNECTION=mongodb+srv://username:password@path.to.mongodb.server/dbName?retryWrites=true&w=majority
TOKEN_SECRET=my-super-random-secret
ALLOWED_ORIGINS="http://localhost:3000"
```

`MONGODB_CONNECTION` should have the connection to the MongoDB database that will be used

`TOKEN_SECRET` is a random secret for the accounts server

`ALLOWED_ORIGINS` is the allowed frontend URL to use the backend functions. You should use `"http://localhost:3000"` if you're using the default react port locally.

## Run the netlify functions locally

You should be in the root directory, then run this.

```console
$ netlify dev
```

The graphql API should now be available by default in `http://localhost:8888/.netlify/functions/graphql`
