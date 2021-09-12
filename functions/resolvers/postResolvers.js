const { validateAttachment, destroy } = require("../utils/cloudinary");

const Post = require("../models/post.js");
const User = require("../models/user.js");
const {
  loginCheck,
  isCourseStudent,
  isGroupStudent,
  isCourseTeacher,
} = require("../utils/checks");

module.exports = {
  Post: {
    user: async (post) => await User.findById(post.user),
  },

  Mutation: {
    createPost: async (_, { input }, context) => {
      loginCheck(context);

      const { courseId, groupId, content, category, tags } = input;

      if (groupId && courseId)
        throw Error("should only provide groupId OR courseId");
      if (!groupId && !courseId)
        throw Error("should provide groupId OR courseId");

      const userId = context.user.id;

      if (courseId) {
        if (
          !(await isCourseStudent(userId, courseId)) &&
          !(await isCourseTeacher(userId, courseId))
        )
          throw Error("not in course");
      }

      if (groupId) {
        if (!(await isGroupStudent(userId, groupId)))
          throw Error("not in group");
      }

      const post = new Post({
        group: groupId,
        courseId: courseId,
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
