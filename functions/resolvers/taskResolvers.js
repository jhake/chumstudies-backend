const { GroupSubmission, GroupActivity, Group, GroupStudent, Task, Student } = require("../models");
const { loginCheck } = require("../utils/checks");
const { validateFile } = require("../utils/cloudinary");

module.exports = {
  Task: {
    student: async ({ student }) => await Student.findById(student),
    groupSubmission: async ({ groupSubmission }) => await GroupSubmission.findById(groupSubmission),
  },

  Mutation: {
    createTask: async (_, { groupSubmissionId, studentId, title, note, dueAt }, context) => {
      loginCheck(context);

      const task = await Task.findOne({ groupSubmission: groupSubmissionId, student: studentId });
      if (task) throw Error("already has task");

      const groupSubmission = await GroupSubmission.findById(groupSubmissionId);
      if (!groupSubmission) throw Error("group submission doesn't exist");
      const groupActivity = await GroupActivity.findById(groupSubmission.groupActivity);
      const groups = await Group.find({ course: groupActivity.course });

      const groupStudentLeader = await GroupStudent.findOne({
        student: context.user.id,
        group: { $in: groups },
      });

      if (!groupStudentLeader) throw Error("not a group member");
      if (groupStudentLeader.type !== "leader") throw Error("not a leader");

      const groupStudentAssignee = await GroupStudent.findOne({
        student: studentId,
        group: { $in: groups },
      });

      if (!groupStudentAssignee) throw Error("not a group member");

      const newTask = new Task({
        groupSubmission: groupSubmissionId,
        student: studentId,
        title,
        note,
        dueAt,
      });

      return await newTask.save();
    },
    changeTaskStatus: async (_, { taskId, status }, context) => {
      loginCheck(context);

      const task = await Task.findById(taskId);
      if (!task) throw Error("task not found");

      if (task.student == context.user.id) {
        task.status = status;
      } else {
        const groupSubmission = await GroupSubmission.findById(task.groupSubmission);
        const groupActivity = await GroupActivity.findById(groupSubmission.groupActivity);
        const groups = await Group.find({ course: groupActivity.course });

        const groupStudent = await GroupStudent.findOne({
          student: context.user.id,
          group: { $in: groups },
        });

        if (groupStudent.type !== "leader") throw Error("can't change status of this task");

        task.status = status;
      }

      return await task.save();
    },
    submitTask: async (_, { taskId, attachment, description }, context) => {
      loginCheck(context);

      const task = await Task.findById(taskId);
      if (!task) throw Error("task not found");
      if (task.student != context.user.id) throw Error("not your task");
      if (task.attachment) throw Error("already submitted");

      const cloudinaryObject = JSON.parse(attachment);

      if (!cloudinaryObject.public_id.includes(`Task_${taskId}`))
        throw Error("public_id not valid attachment for the task");

      await validateFile(attachment);

      task.attachment = attachment;
      task.description = description;
      task.submittedAt = Date.now();

      return await task.save();
    },
  },
};
