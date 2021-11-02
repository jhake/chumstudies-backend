const { validateFile } = require("../utils/cloudinary");

const {
  Activity,
  Course,
  GroupActivity,
  Post,
  Submission,
  Group,
  GroupStudent,
  GroupSubmission,
} = require("../models/index.js");
const { loginCheck, isCourseTeacher, isCourseStudent } = require("../utils/checks");

module.exports = {
  Activity: {
    course: async (activity) => await Course.findById(activity.course),
    mySubmission: async ({ id }, _, context) => await Submission.findOne({ activity: id, student: context.user.id }),
  },
  GroupActivity: {
    course: async (groupActivity) => await Course.findById(groupActivity.course),
    mySubmission: async ({ id, course }, _, context) => {
      const groups = await Group.find({ course: course });
      const groupStudent = await GroupStudent.findOne({
        student: context.user.id,
        group: { $in: groups },
      });

      if (!groupStudent) return null;
      return await GroupSubmission.findOne({ groupActivity: id, group: groupStudent.group });
    },
  },

  Query: {
    activity: async (_, { activityId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const activity = await Activity.findById(activityId);
      if (!activity) return null;

      const inCourse =
        (await isCourseStudent(userId, activity.course)) || (await isCourseTeacher(userId, activity.course));
      if (!inCourse) throw Error("not in course");

      return activity;
    },

    groupActivity: async (_, { groupActivityId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const groupActivity = await GroupActivity.findById(groupActivityId);
      if (!groupActivity) return null;

      const inCourse =
        (await isCourseStudent(userId, groupActivity.course)) || (await isCourseTeacher(userId, groupActivity.course));
      if (!inCourse) throw Error("not in course");

      return groupActivity;
    },

    courseActivities: async (_, { courseId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      const inCourse = (await isCourseStudent(userId, courseId)) || course.teacher == userId;
      if (!inCourse) throw Error("not in course");

      const filter = { course: courseId };

      return {
        data: await Activity.find(filter).sort({ _id: -1 }),
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
        data: await GroupActivity.find(filter).sort({ _id: -1 }),
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

      await validateFile(attachment);
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

      const groups = await Group.find({ course: courseId });
      await GroupSubmission.insertMany(groups.map(({ id }) => ({ group: id, groupActivity: groupActivity.id })));

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

      await validateFile(attachment);
      groupActivity.attachment = attachment;

      return await groupActivity.save();
    },
  },
};
