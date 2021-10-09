const { CourseStudent, GroupStudent, Post, Course, Group } = require("../models/index.js");

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
      const studyGroups = await Group.find(studyGroupsFilter).limit(3);
      const classGroups = await Group.find(classGroupsFilter).limit(3);

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

      return {
        data: await Post.find(filter).sort({ _id: -1 }),
      };
    },
  },
};
