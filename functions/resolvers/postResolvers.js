const { validateAttachment, destroy } = require("../utils/cloudinary");

const Post = require("../models/post.js");
const User = require("../models/user.js");
const { loginCheck } = require("../utils/checks");

module.exports = {
  Post: {
    user: async (post) => await User.findById(post.user),
  },

  Mutation: {
    createPost: async (_, args, context) => {
      loginCheck(context);

      const { content, category, tags } = args.input;

      const post = new Post({
        content,
        category,
        tags,
        user: context.user.id,
      });

      return await post.save();
    },

    addAttachmentToPost: async (_, args, context) => {
      loginCheck(context);

      const post = await Post.findById(args.id, "user attachment");
      if (!post) throw Error("post not found");
      if (post.user != context.user.id) throw Error("not your post");
      if (post.attachment) throw Error("already has attachment");

      const cloudinaryObject = JSON.parse(args.attachment);

      if (!cloudinaryObject.public_id.includes(`Post_${args.id}`))
        throw Error("public_id not valid attachment for the post");

      await validateAttachment(args.attachment);
      post.attachment = args.attachment;

      return await post.save();
    },

    destroyPost: async (_, args, context) => {
      loginCheck(context);

      const post = await Post.findById(args.id, "author attachment");
      if (!post) throw Error("post not found");
      if (post.user != context.user.id) throw Error("not your post");

      if (post.attachment) await destroy(post.attachment);

      await Post.findOneAndDelete(args.id);
      return true;
    },
  },
};
