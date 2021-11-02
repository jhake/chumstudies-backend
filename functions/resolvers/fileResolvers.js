const { Post, User, Activity, GroupActivity, Course, Group } = require("../models/index.js");
const { loginCheck, isCourseStudent, isGroupStudent } = require("../utils/checks");

module.exports = {
  File: {
    user: async (file) => await User.findById(file.user),
  },

  Query: {
    courseFiles: async (_, { courseId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      const inCourse = (await isCourseStudent(userId, courseId)) || course.teacher == userId;
      if (!inCourse) throw Error("not in course");

      const filter = { course: courseId, attachment: { $exists: true } };

      return {
        postFiles: await Post.find(filter).sort({ _id: -1 }),
        activityFiles: await Activity.find(filter).sort({ _id: -1 }),
        groupActivityFiles: await GroupActivity.find(filter).sort({ _id: -1 }),
      };
    },

    classGroupFiles: async (_, { groupId }, context) => {
      loginCheck(context);

      const userId = context.user.id;

      const inGroup = await isGroupStudent(userId, groupId);
      if (!inGroup) throw Error("not in group");

      const group = await Group.findById(groupId);

      const postFilter = { group: groupId, attachment: { $exists: true } };
      const groupActivityFilter = { course: group.course };

      return {
        postFiles: await Post.find(postFilter).sort({ _id: -1 }),
        groupActivityFiles: await GroupActivity.find(groupActivityFilter).sort({ _id: -1 }),
      };
    },

    studyGroupFiles: async (_, { groupId }, context) => {
      loginCheck(context);

      const userId = context.user.id;

      const inGroup = await isGroupStudent(userId, groupId);
      if (!inGroup) throw Error("not in group");

      const filter = { group: groupId, attachment: { $exists: true } };

      return {
        postFiles: await Post.find(filter).sort({ _id: -1 }),
      };
    },
  },
};
