const { Post, User, Comment } = require("../models/index.js");
const { loginCheck, isCourseStudent, isGroupStudent, isCourseTeacher } = require("../utils/checks");

module.exports = {
  Comment: {
    user: async ({ user }) => await User.findById(user),
    post: async ({ post }) => await Post.findById(post),
  },

  Query: {
    postComments: async (_, { postId }, context) => {
      loginCheck(context);

      const userId = context.user.id;

      const post = await Post.findById(postId);
      const { course, group } = post;

      if (course) {
        if (!(await isCourseStudent(userId, course)) && !(await isCourseTeacher(userId, course)))
          throw Error("not in course");
      }

      if (group) {
        if (!(await isGroupStudent(userId, group))) throw Error("not in group");
      }

      const comments = await Comment.find({ post });

      return { data: comments };
    },
  },

  Mutation: {
    createPostComment: async (_, { postId, content }, context) => {
      loginCheck(context);

      const userId = context.user.id;

      const post = await Post.findById(postId);
      const { course, group } = post;

      if (course) {
        if (!(await isCourseStudent(userId, course)) && !(await isCourseTeacher(userId, course)))
          throw Error("not in course");
      }

      if (group) {
        if (!(await isGroupStudent(userId, group))) throw Error("not in group");
      }

      const comment = new Comment({
        user: userId,
        post,
        content,
      });

      return await comment.save();
    },
  },
};
