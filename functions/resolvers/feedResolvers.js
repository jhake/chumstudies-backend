const mongoose = require("mongoose");

const Post = require("../models/post.js");
const Activity = require("../models/activity.js");
const GroupActivity = require("../models/groupActivity.js");
const CourseStudent = require("../models/courseStudent.js");
const GroupStudent = require("../models/groupStudent.js");

const { loginCheck } = require("../utils/checks.js");

module.exports = {
  Query: {
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
              $in: courseStudents?.map(({ course }) => mongoose.Types.ObjectId(course)) ?? [],
            },
          },
          {
            group: {
              $in: groupsStudents?.map(({ group }) => mongoose.Types.ObjectId(group)) ?? [],
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
