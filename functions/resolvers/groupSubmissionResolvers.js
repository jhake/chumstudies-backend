const { GroupActivity, GroupStudent, GroupSubmission, Group } = require("../models/index.js");
const { loginCheck, isCourseTeacher, isGroupStudent } = require("../utils/checks");

module.exports = {
  GroupSubmission: {
    groupActivity: async ({ groupActivity }) => await GroupActivity.findById(groupActivity),
    group: async ({ group }) => await Group.findById(group),
  },

  Query: {
    groupSubmission: async (_, { groupSubmissionId }, context) => {
      loginCheck(context);

      const groupSubmission = await GroupSubmission.findById(groupSubmissionId);
      if (!groupSubmission) return null;

      const groupActivity = await GroupActivity.findById(groupSubmission.groupActivity);

      const allowedToQuery =
        (await isCourseTeacher(context.user.id, groupActivity.course)) ||
        (await isGroupStudent(context.user.id, groupSubmission.group));

      if (!allowedToQuery) throw Error("you must be the teacher of the course to see this submission");

      return groupSubmission;
    },
    groupActivitySubmissions: async (_, { groupActivityId }, context) => {
      loginCheck(context);

      const groupActivity = await GroupActivity.findById(groupActivityId);
      if (!(await isCourseTeacher(context.user.id, groupActivity.course)))
        throw Error("you must be the teacher of the course to see all submissions");

      const filter = { groupActivity: groupActivityId };

      return {
        data: await GroupSubmission.find(filter),
      };
    },
  },

  Mutation: {
    createGroupSubmission: async (_, { groupActivityId }, context) => {
      loginCheck(context);

      const groupActivity = await GroupActivity.findById(groupActivityId);

      if (!groupActivity) throw Error("group activity doesn't exist");

      const groups = await Group.find({ course: groupActivity.course });
      const groupStudent = await GroupStudent.findOne({
        student: context.user.id,
        group: { $in: groups },
      });

      if (!groupStudent) throw Error("you are not assigned to this group activity");
      if (groupStudent.type !== "leader") throw Error("you are not the leader of the group");

      const groupSubmission = await GroupSubmission.findOne({
        groupActivity,
        group: groupStudent.group,
      });
      if (groupSubmission) throw Error("already has submission in this activity");

      const newGroupSubmission = new GroupSubmission({
        groupActivity: groupActivityId,
        group: groupStudent.group,
      });

      return await newGroupSubmission.save();
    },
  },
};
