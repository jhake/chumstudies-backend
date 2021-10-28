const { validateAttachment } = require("../utils/cloudinary");

const { Activity, Submission } = require("../models/index.js");
const { loginCheck, isCourseStudent } = require("../utils/checks");

module.exports = {
  Submission: {
    activity: async (submission) => await Activity.findById(submission.activity),
  },

  Mutation: {
    createSubmission: async (_, args, context) => {
      loginCheck(context);

      const { activityId } = args;
      const activity = await Activity.findById(activityId);

      if (!activity) throw Error("activity doesn't exist");
      if (!(await isCourseStudent(context.user.id, activity.course)))
        throw Error("you must be a student of the course to create a submission in this activity");

      const submission = await Submission.findOne({
        activity,
        student: context.user.id,
      });
      if (submission) throw Error("already has submission in this activity");

      const newSubmission = new Submission({
        ...args,
        student: context.user.id,
      });

      return await newSubmission.save();
    },
    addAttachmentToSubmission: async (_, { id: submissionId, attachment }, context) => {
      loginCheck(context);

      const submission = await Submission.findById(submissionId);
      if (!submission) throw Error("submission not found");
      if (submission.student != context.user.id) throw Error("not your submission");
      if (submission.submittedAt) throw Error("already submitted");
      if (submission.attachment) throw Error("already has attachment");

      const cloudinaryObject = JSON.parse(attachment);

      if (!cloudinaryObject.public_id.includes(`Submission_${submissionId}`))
        throw Error("public_id not valid attachment for the post");

      await validateAttachment(attachment);
      submission.attachment = attachment;

      return await submission.save();
    },
    submitSubmission: async (_, { id: submissionId }, context) => {
      loginCheck(context);

      const submission = await Submission.findById(submissionId);
      if (!submission) throw Error("submission not found");
      if (submission.student != context.user.id) throw Error("not your submission");
      if (submission.submittedAt) throw Error("already submitted");

      submission.submittedAt = Date.now();

      return await submission.save();
    },
  },
};
