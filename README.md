# Chumstudies Backend

This is a serverless implementation of the backend service for [Chumstudies](https://chumstudies.netlify.app/).

Notable libraries used.

- [apollo-server-lambda](https://www.npmjs.com/package/apollo-server-lambda)
- [accounts-js](https://www.accountsjs.com/)
- [mongoose](https://mongoosejs.com/)
- [cloudinary](https://cloudinary.com/)

## Setup local development

### Prerequisites

- Node 14 or later
- MongoDB database
- Cloudinary

### Install Netlify CLI globally

```console
$ npm install netlify-cli -g
```

### Install node modules

Go to the functions folder then run `npm install`

```console
$ cd functions
$ npm install
```

### Set environment variables

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

CLOUDINARY_CLOUD_NAME=somecloudname
CLOUDINARY_API_KEY=12345
CLOUDINARY_API_SECRET=11111
CLOUDINARY_METADATA_EXTERNAL_ID=22222
```

`MONGODB_CONNECTION` should have the connection to the MongoDB database that will be used

`TOKEN_SECRET` is a random secret for the accounts server

`ALLOWED_ORIGINS` is the allowed frontend URL to use the backend functions. You should use `"http://localhost:3000"` if you're using the default react port locally.

`CLOUDINARY_...` are for cloudinary stuff.

### Run the netlify functions locally

You should be in the root directory, then run this.

```console
$ netlify dev
```

The graphql API should now be available by default in `http://localhost:8888/.netlify/functions/graphql`

## Folder structure

The directories mentioned in this section are relative to the `functions` folder.

- `accounts.js` contains the setup for accounts-js and also the mongoose connection.
- `graphql.js` contains the setup for the apollo server.
- `models` folder contains the Mongoose models. Each file there should represent an entity. For example `models/user.js` contains the Mongoose model for the User entity.
- `schema` folder contains the graphql schema. Each file will contain graphql typeDefs and resolvers related to the entity. For example, `schema/course.js` contains the typeDefs and resolvers related to the Course entity (like the `joinCourse` mutation). Each file here should be imported in the `schema/index.js` to be merged together.

Most (if not all) of the development will happen inside the `models` and `schema` folders.
