const { validateAttachment, destroy } = require("../utils/cloudinary");
const { Post, User, Activity, GroupActivity, Course, Group, Comment } = require("../models/index.js");
const { loginCheck, isCourseStudent, isGroupStudent, isCourseTeacher } = require("../utils/checks");

module.exports = {
  Post: {
    user: async (post) => await User.findById(post.user),
    activity: async (post) => await Activity.findById(post.activity),
    groupActivity: async (post) => await GroupActivity.findById(post.groupActivity),
    comments: async ({ id }) => ({
      data: await Comment.find({ post: id }),
    }),
  },

  Query: {
    coursePosts: async (_, { courseId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      const inCourse = (await isCourseStudent(userId, courseId)) || course.teacher == userId;
      if (!inCourse) throw Error("not in course");

      const filter = { course: courseId };

      return {
        data: await Post.find(filter),
      };
    },

    groupPosts: async (_, { groupId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const group = await Group.findById(groupId);
      if (!group) return null;

      const allowedToQuery = (await isGroupStudent(userId, groupId)) || (await isCourseTeacher(userId, group.course));
      if (!allowedToQuery) throw Error("not allowed to query group");

      const filter = { group: groupId };

      return {
        data: await Post.find(filter),
      };
    },
  },

  Mutation: {
    createPost: async (_, args, context) => {
      loginCheck(context);

      const { courseId, groupId } = args;

      if (groupId && courseId) throw Error("should only provide groupId OR courseId");
      if (!groupId && !courseId) throw Error("should provide groupId OR courseId");

      const userId = context.user.id;

      if (courseId) {
        if (!(await isCourseStudent(userId, courseId)) && !(await isCourseTeacher(userId, courseId)))
          throw Error("not in course");
      }

      if (groupId) {
        if (!(await isGroupStudent(userId, groupId))) throw Error("not in group");
      }

      const post = new Post({
        ...args,
        course: courseId,
        group: groupId,
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
