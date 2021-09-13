const { Group, GroupStudent, Student } = require("../models/index.js");
const { loginCheck, isCourseTeacher, isCourseStudentMulti, isMemberOfClassGroupMulti } = require("../utils/checks.js");

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
  },

  Query: {
    groups: async (_, { pagination }, context) => {
      loginCheck(context);
      const limit = pagination?.limit ?? 10;
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
    createClassGroup: async (_, { input }, context) => {
      loginCheck(context);

      const { courseId, name } = input;

      if (!(await isCourseTeacher(context.user.id, courseId)))
        throw Error("you must be the teacher of the course to create a class group");

      const group = new Group({
        name,
        course: courseId,
      });

      return await group.save();
    },
    assignStudentsToClassGroup: async (_, { input }, context) => {
      loginCheck(context);

      const { groupId, studentIds } = input;

      const group = await Group.findById(groupId);

      if (!(await isCourseTeacher(context.user.id, group.course)))
        throw Error("you must be the teacher of the course to assign students to a class group");

      console.log(await isCourseStudentMulti(studentIds, group.course));

      if (!(await isCourseStudentMulti(studentIds, group.course)))
        throw Error("all students must be a member of the course");

      if (await isMemberOfClassGroupMulti(studentIds, group.course))
        throw Error("all students must not have a group in the course yet");

      await GroupStudent.insertMany(
        studentIds.map((studentId) => ({
          group: groupId,
          student: studentId,
        }))
      );

      return group;
    },
    createStudyGroup: async (_, { input }, context) => {
      loginCheck(context);

      const { name } = input;

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
