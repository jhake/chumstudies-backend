const { gql } = require("apollo-server-lambda");
const { updateMetadata, destroy } = require("../utils/cloudinary");

const Post = require("../models/post.js");
const User = require("../models/user.js");
const { loginCheck } = require("../utils/checks");

exports.typeDef = gql`
  extend type Mutation {
    createPost(input: CreatePostInput!): Post
    destroyPost(id: ID!): Boolean
  }

  type Post {
    id: ID
    content: String
    attachment: String
    author: User
  }

  input CreatePostInput {
    content: String!
    attachment: String
  }
`;

exports.resolvers = {
  Post: {
    author: async (post) => await User.findById(post.author),
  },

  Mutation: {
    createPost: async (_, args, context) => {
      loginCheck(context);

      const { content, attachment } = args.input;

      const post = new Post({
        content,
        attachment,
        author: context.user.id,
      });

      if (attachment) {
        await updateMetadata(attachment, `Post_${post.id}`);
      }

      return await post.save();
    },

    destroyPost: async (_, args, context) => {
      loginCheck(context);

      const post = await Post.findById(args.id, "author attachment");
      if (!post) throw new Error("post not found");
      if (post.author != context.user.id) throw new Error("not your post");

      if (post.attachment) await destroy(post.attachment);

      await Post.findOneAndDelete(args.id);
      return true;
    },
  },
};
