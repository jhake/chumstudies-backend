const { validateFile } = require("../utils/cloudinary");

const { Activity, Submission, Student } = require("../models/index.js");
const { loginCheck, isCourseStudent, isCourseTeacher } = require("../utils/checks");

module.exports = {
  Submission: {
    activity: async ({ activity }) => await Activity.findById(activity),
    student: async ({ student }) => await Student.findById(student),
  },

  Query: {
    submission: async (_, { submissionId }, context) => {
      loginCheck(context);

      const submission = await Submission.findById(submissionId);
      const activity = await Activity.findById(submission.activity);

      if (!(activity.student == context.user.id || (await isCourseTeacher(context.user.id, activity.course))))
        throw Error("you must be the teacher of the course to see this submission");

      return submission;
    },
    activitySubmissions: async (_, { activityId }, context) => {
      loginCheck(context);

      const activity = await Activity.findById(activityId);
      if (!(await isCourseTeacher(context.user.id, activity.course)))
        throw Error("you must be the teacher of the course to see all submissions");

      const filter = { activity: activityId };

      return {
        data: await Submission.find(filter),
      };
    },
  },

  Mutation: {
    createSubmission: async (_, { description, activityId }, context) => {
      loginCheck(context);

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
        description,
        activity: activityId,
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

      await validateFile(attachment);
      submission.attachment = attachment;
      submission.submittedAt = Date.now();

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
    gradeSubmission: async (_, { submissionId, grade }, context) => {
      loginCheck(context);

      const submission = await Submission.findById(submissionId);
      const activity = await Activity.findById(submission.activity);
      if (!(await isCourseTeacher(context.user.id, activity.course)))
        throw Error("you must be the teacher of the course to grade this submission");

      if (!submission.submittedAt) throw Error("submission not yet final");

      if (grade > activity.points) throw Error("grade is higher than maximum");
      if (grade < 0) throw Error("grade is negative");

      submission.grade = grade;

      return await submission.save();
    },
  },
};
