const { validateAttachment } = require("../utils/cloudinary");

const { Activity, Course, GroupActivity } = require("../models/index.js");
const { loginCheck, isCourseTeacher } = require("../utils/checks");

module.exports = {
  Activity: {
    course: async (activity) => await Course.findById(activity.course),
  },
  GroupActivity: {
    course: async (groupActivity) => await Course.findById(groupActivity.course),
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

      return await activity.save();
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

      return await groupActivity.save();
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
