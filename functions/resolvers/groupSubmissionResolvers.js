const { GroupActivity, GroupStudent, GroupSubmission, Group, Task, Student } = require("../models/index.js");
const { loginCheck, isCourseTeacher, isGroupStudent } = require("../utils/checks");
const { validateFile } = require("../utils/cloudinary.js");

module.exports = {
  GroupSubmission: {
    groupActivity: async ({ groupActivity }) => await GroupActivity.findById(groupActivity),
    submittedBy: async ({ submittedBy }) => await Student.findById(submittedBy),
    group: async ({ group }) => await Group.findById(group),
    tasks: async ({ id }) => ({
      data: await Task.find({ groupSubmission: id }),
    }),
    myTask: async ({ id }, _, context) => await Task.findOne({ groupSubmission: id, student: context.user.id }),
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
    groupSubmissionOfGroup: async (_, { groupActivityId, groupId }, context) => {
      loginCheck(context);

      const groupActivity = await GroupActivity.findById(groupActivityId);

      const allowedToQuery =
        (await isCourseTeacher(context.user.id, groupActivity.course)) ||
        (await isGroupStudent(context.user.id, groupId));

      if (!allowedToQuery) throw Error("not allowed to query");

      return await GroupSubmission.find({ groupActivity: groupActivityId, group: groupId });
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
    submitGroupSubmission: async (_, { groupSubmissionId, description, attachment }, context) => {
      loginCheck(context);

      const groupSubmission = await GroupSubmission.findById(groupSubmissionId);
      if (!(await isGroupStudent(context.user.id, groupSubmission.group))) throw Error("not your submission");

      if (groupSubmission.submittedAt) throw Error("already submitted");

      if (attachment) {
        const cloudinaryObject = JSON.parse(attachment);

        if (!cloudinaryObject.public_id.includes(`GroupSubmission_${groupSubmissionId}`))
          throw Error("public_id not valid attachment for the submission");

        await validateFile(attachment);

        groupSubmission.attachment = attachment;
      }

      groupSubmission.description = description;
      groupSubmission.submittedBy = context.user.id;
      groupSubmission.submittedAt = Date.now();

      return await groupSubmission.save();
    },
  },
};
