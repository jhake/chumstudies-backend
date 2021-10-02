const { Post, User, Comment, CommentUserVote } = require("../models/index.js");
const { loginCheck, isCourseStudent, isGroupStudent, isCourseTeacher } = require("../utils/checks");

module.exports = {
  Comment: {
    user: async ({ user }) => await User.findById(user),
    post: async ({ post }) => await Post.findById(post),
    vote: async (comment, _, context) => (await CommentUserVote.findOne({ comment, user: context.user.id }))?.vote ?? 0,
  },

  Query: {
    postComments: async (_, { postId }, context) => {
      loginCheck(context);

      // const userId = context.user.id;

      // const post = await Post.findById(postId).select({ course: 1, group: 1 });
      // const { course, group } = post;

      // if (course) {
      //   if (!(await isCourseStudent(userId, course)) && !(await isCourseTeacher(userId, course)))
      //     throw Error("not in course");
      // }

      // if (group) {
      //   if (!(await isGroupStudent(userId, group))) throw Error("not in group");
      // }

      const comments = await Comment.find({ post: postId });

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

    voteComment: async (_, { commentId, vote }, context) => {
      loginCheck(context);

      if (![-1, 0, 1].includes(vote)) throw Error("invalid vote value");

      const userId = context.user.id;

      const comment = await Comment.findById(commentId);
      if (!comment) throw Error("comment does not exist");

      const post = await Post.findById(comment.post);
      const { course, group } = post;

      if (course) {
        if (!(await isCourseStudent(userId, course)) && !(await isCourseTeacher(userId, course)))
          throw Error("not in course");
      }

      if (group) {
        if (!(await isGroupStudent(userId, group))) throw Error("not in group");
      }

      const commentUserVote = await CommentUserVote.findOne({ comment, user: userId });

      if (commentUserVote) {
        const originalVote = commentUserVote.vote;
        commentUserVote.vote = vote;
        comment.score += vote - originalVote;

        await commentUserVote.save();
      } else {
        const newCommentUserVote = new CommentUserVote({ comment, user: userId, vote });
        comment.score += vote;

        await newCommentUserVote.save();
      }

      return await comment.save();
    },
  },
};
