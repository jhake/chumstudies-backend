const { CourseStudent, GroupStudent, Post, Activity, GroupActivity, Course, Group } = require("../models/index.js");

const { loginCheck } = require("../utils/checks.js");

module.exports = {
  Query: {
    studentLeftSidePanel: async (_, __, context) => {
      loginCheck(context);
      const studentId = context.user.id;

      const courseStudents = await CourseStudent.find({ student: studentId });
      const courseFilter = {
        _id: {
          $in: courseStudents?.map(({ course }) => course) ?? [],
        },
      };

      const groupStudents = await GroupStudent.find({ student: studentId });
      const studyGroupsFilter = {
        _id: {
          $in: groupStudents?.map(({ group }) => group) ?? [],
        },
        course: { $exists: false },
      };
      const classGroupsFilter = {
        _id: {
          $in: groupStudents?.map(({ group }) => group) ?? [],
        },
        course: { $exists: true },
      };

      const courses = await Course.find(courseFilter).limit(3);
      const studyGroups = await Group.find(studyGroupsFilter);
      const classGroups = await Group.find(classGroupsFilter);

      return {
        courses,
        studyGroups,
        classGroups,
      };
    },
    studentHomeFeed: async (_, __, context) => {
      loginCheck(context);

      const studentId = context.user.id;

      const courseStudents = await CourseStudent.find({
        student: studentId,
      });
      const groupsStudents = await GroupStudent.find({
        student: studentId,
      });

      console.log(courseStudents);

      const filter = {
        $or: [
          {
            course: {
              $in: courseStudents?.map(({ course }) => course) ?? [],
            },
          },
          {
            group: {
              $in: groupsStudents?.map(({ group }) => group) ?? [],
            },
          },
        ],
      };

      const posts = (await Post.find(filter).sort("-createdAt")).map((post) => ({
        ...post._doc,
        id: post.id,
        mongooseType: "Post",
      }));
      const activities = (await Activity.find(filter)).map((activity) => ({
        ...activity._doc,
        id: activity.id,
        mongooseType: "Activity",
      }));
      const groupActivities = (await GroupActivity.find(filter)).map((groupActivity) => ({
        ...groupActivity._doc,
        id: groupActivity.id,
        mongooseType: "GroupActivity",
      }));

      console.log(posts);
      console.log(activities);
      console.log(groupActivities);

      const items = [...posts, ...activities, ...groupActivities];

      const retVal = {
        items: items.map((item) =>
          item.mongooseType === "Post"
            ? { post: item }
            : item.mongooseType === "Activity"
            ? { activity: item }
            : item.mongooseType === "GroupActivity"
            ? { GroupActivity: item }
            : null
        ),
      };

      return retVal;
    },
  },
};
