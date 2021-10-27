const { validateAttachment } = require("../utils/cloudinary");

const { Activity, Course, GroupActivity, Post } = require("../models/index.js");
const { loginCheck, isCourseTeacher, isCourseStudent } = require("../utils/checks");

module.exports = {
  Activity: {
    course: async (activity) => await Course.findById(activity.course),
  },
  GroupActivity: {
    course: async (groupActivity) => await Course.findById(groupActivity.course),
  },

  Query: {
    courseActivities: async (_, { courseId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      const inCourse = (await isCourseStudent(userId, courseId)) || course.teacher == userId;
      if (!inCourse) throw Error("not in course");

      const filter = { course: courseId };

      return {
        data: await Activity.find(filter),
      };
    },
    courseGroupActivities: async (_, { courseId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      const inCourse = (await isCourseStudent(userId, courseId)) || course.teacher == userId;
      if (!inCourse) throw Error("not in course");

      const filter = { course: courseId };

      return {
        data: await GroupActivity.find(filter),
      };
    },
  },

  Mutation: {
    createActivity: async (_, args, context) => {
      loginCheck(context);

      const { courseId } = args;

      if (!(await isCourseTeacher(context.user.id, courseId)))
        throw Error("you must be the teacher of the course to create an activity");

      const activity = new Activity({
        ...args,
        course: courseId,
      });

      const post = new Post({
        user: context.user.id,
        course: courseId,
        activity: activity,
      });

      await activity.save();
      await post.save();

      return activity;
    },
    addAttachmentToActivity: async (_, { id: activityId, attachment }, context) => {
      loginCheck(context);

      const activity = await Activity.findById(activityId);
      if (!activity) throw Error("activity not found");
      if (!(await isCourseTeacher(context.user.id, activity.course)))
        throw Error("you must be the teacher of the course to edit the activity");
      if (activity.attachment) throw Error("already has attachment");

      const cloudinaryObject = JSON.parse(attachment);

      if (!cloudinaryObject.public_id.includes(`Activity_${activityId}`))
        throw Error("public_id not valid attachment for the post");

      await validateAttachment(attachment);
      activity.attachment = attachment;

      return await activity.save();
    },
    createGroupActivity: async (_, args, context) => {
      loginCheck(context);

      const { courseId } = args;

      if (!(await isCourseTeacher(context.user.id, courseId)))
        throw Error("you must be the teacher of the course to create an activity");

      const groupActivity = new GroupActivity({
        ...args,
        course: courseId,
      });

      const post = new Post({
        user: context.user.id,
        course: courseId,
        groupActivity: groupActivity,
      });

      await groupActivity.save();
      await post.save();

      return groupActivity;
    },
    addAttachmentToGroupActivity: async (_, { id: groupActivityId, attachment }, context) => {
      loginCheck(context);

      const groupActivity = await GroupActivity.findById(groupActivityId);
      if (!groupActivity) throw Error("activity not found");
      if (!(await isCourseTeacher(context.user.id, groupActivity.course)))
        throw Error("you must be the teacher of the course to edit the activity");
      if (groupActivity.attachment) throw Error("already has attachment");

      const cloudinaryObject = JSON.parse(attachment);

      if (!cloudinaryObject.public_id.includes(`GroupActivity_${groupActivityId}`))
        throw Error("public_id not valid attachment for the post");

      await validateAttachment(attachment);
      groupActivity.attachment = attachment;

      return await groupActivity.save();
    },
  },
};
