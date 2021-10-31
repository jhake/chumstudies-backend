const { GroupActivity, GroupStudent, GroupSubmission, Group } = require("../models/index.js");
const { loginCheck } = require("../utils/checks");

module.exports = {
  GroupSubmission: {},

  Query: {},

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
