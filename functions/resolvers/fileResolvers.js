const { Post, User, Activity, GroupActivity, Course } = require("../models/index.js");
const { loginCheck, isCourseStudent } = require("../utils/checks");

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
        postFiles: await Post.find(filter),
        activityFiles: await Activity.find(filter),
        groupActivityFiles: await GroupActivity.find(filter),
      };
    },
  },
};
