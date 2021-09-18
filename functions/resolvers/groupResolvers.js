const { Group, GroupStudent, Student, Course } = require("../models/index.js");
const {
  loginCheck,
  isCourseTeacher,
  isCourseStudentMulti,
  isMemberOfClassGroupMulti,
  isGroupStudent,
} = require("../utils/checks.js");

module.exports = {
  Group: {
    students: async (group) => {
      const groupStudents = await GroupStudent.find({ group });
      const filter = {
        _id: {
          $in: groupStudents?.map(({ student }) => student) ?? [],
        },
      };
      return {
        data: await Student.find(filter),
        pagination: null,
      };
    },
    admins: async (group) => {
      const groupStudents = await GroupStudent.find({ group, type: "admin" });
      const filter = {
        _id: {
          $in: groupStudents?.map(({ student }) => student) ?? [],
        },
      };
      return {
        data: await Student.find(filter),
        pagination: null,
      };
    },
    leader: async (group) => {
      const groupStudent = await GroupStudent.findOne({ group, type: "leader" });
      return await Student.findById(groupStudent?.student);
    },
    groupCode: async (group, _, context) => {
      const groupStudent = await GroupStudent.findOne({ group, student: context.user.id });
      if (!groupStudent) return null;

      return group.groupCode;
    },
    course: async (group) => {
      return await Course.findById(group.course);
    },
    type: (group) => {
      return group.course ? "CLASS" : "STUDY";
    },
  },

  Query: {
    groups: async (_, { pagination }, context) => {
      loginCheck(context);
      const limit = pagination?.limit ?? 30;
      const page = pagination?.page ?? 1;
      const skip = limit * (page - 1);

      const filter = {};

      const totalCount = await Group.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: await Group.find(filter).skip(skip).limit(limit),
        pagination: {
          totalCount,
          totalPages,
        },
      };
    },
  },

  Mutation: {
    createClassGroup: async (_, { courseId, studentIds }, context) => {
      loginCheck(context);

      if (!(await isCourseTeacher(context.user.id, courseId)))
        throw Error("you must be the teacher of the course to create a class group");

      if (!studentIds.length) throw Error("studentIds must not be empty");

      if (!(await isCourseStudentMulti(studentIds, courseId)))
        throw Error("all students must be a member of the course");

      if (await isMemberOfClassGroupMulti(studentIds, courseId))
        throw Error("all students must not have a group in the course yet");

      const groupsCount = await Group.countDocuments({ course: courseId });

      const group = new Group({
        name: `Group ${groupsCount + 1}`,
        course: courseId,
      });

      await GroupStudent.insertMany(
        studentIds.map((studentId) => ({
          group: group.id,
          student: studentId,
        }))
      );

      return await group.save();
    },
    becomeLeader: async (_, { groupId }, context) => {
      loginCheck(context);

      const group = await Group.findById(groupId);
      if (!group.course) throw Error("not a class group");
      if (!(await isGroupStudent(context.user.id, groupId))) throw Error("not a member of the group");

      const groupStudentLeader = await GroupStudent.findOne({ group: groupId, type: "leader" });
      if (groupStudentLeader) throw Error("group already has a leader");

      const groupStudent = await GroupStudent.findOne({ group: groupId, student: context.user.id });
      groupStudent.type = "leader";

      await groupStudent.save();

      return group;
    },
    transferLeadership: async (_, { groupId, studentId }, context) => {
      loginCheck(context);

      const group = await Group.findById(groupId);
      if (!group.course) throw Error("not a class group");

      const groupStudentCurrentLeader = await GroupStudent.findOne({
        group: groupId,
        student: context.user.id,
        type: "leader",
      });
      if (!groupStudentCurrentLeader) throw Error("not group leader");

      const groupStudentNewLeader = await GroupStudent.findOne({ group: groupId, student: studentId });
      if (!groupStudentNewLeader) throw Error("can't transfer to a non-member");

      groupStudentCurrentLeader.type = "regular";
      groupStudentNewLeader.type = "leader";

      await groupStudentCurrentLeader.save();
      await groupStudentNewLeader.save();

      return group;
    },
    createStudyGroup: async (_, { name }, context) => {
      loginCheck(context);

      const student = await Student.findById(context.user.id);
      if (!student) throw Error("you must be a student to create a study group");

      const group = new Group({
        name,
      });

      await group.save();
      const groupStudent = new GroupStudent({ group, student, type: "admin" });
      await groupStudent.save();

      return await group;
    },
    joinStudyGroup: async (_, { groupCode }, context) => {
      loginCheck(context);

      const student = await Student.findById(context.user.id);
      if (!student) throw Error("you must be a student to join a study group");

      const group = await Group.findOne({ groupCode });
      if (!group) throw Error("invalid group code");

      const groupStudent = await GroupStudent.findOne({
        group,
        student,
      });
      if (groupStudent) throw Error("already in group");

      const newGroupStudent = new GroupStudent({
        student,
        group,
      });
      await newGroupStudent.save();

      return group;
    },
  },
};
