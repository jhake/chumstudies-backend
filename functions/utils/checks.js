const { AuthenticationError } = require("apollo-server-lambda");

const { Course, GroupStudent, CourseStudent, Group } = require("../models/index.js");

module.exports.loginCheck = (context) => {
  if (!context.user) throw new AuthenticationError("you must be logged in");
};

module.exports.isCourseTeacher = async (teacherId, courseId) => {
  if (!courseId) return false;

  const course = await Course.findById(courseId).select({ teacher: 1 });
  return course.teacher == teacherId;
};

module.exports.isCourseStudent = async (studentId, courseId) => {
  const courseStudent = await CourseStudent.findOne({
    course: courseId,
    student: studentId,
  }).select({ _id: 1 });

  return !!courseStudent;
};

module.exports.isGroupStudent = async (studentId, groupId) => {
  const groupStudent = await GroupStudent.findOne({
    group: groupId,
    student: studentId,
  }).select({ _id: 1 });

  return !!groupStudent;
};

module.exports.isGroupLeader = async (studentId, groupId) => {
  const groupStudent = await GroupStudent.findOne({
    group: groupId,
    student: studentId,
    type: "leader",
  }).select({ _id: 1 });

  return !!groupStudent;
};

module.exports.isCourseStudentMulti = async (studentIds, courseId) => {
  const courseStudents = await CourseStudent.find({
    course: courseId,
    student: {
      $in: studentIds?.map((studentId) => studentId),
    },
  }).select({ _id: 1 });

  return courseStudents.length === studentIds.length;
};

module.exports.isMemberOfClassGroupMulti = async (studentIds, courseId) => {
  const groups = await Group.find({ course: courseId }).select({ _id: 1 });
  const groupStudents = await GroupStudent.find({
    group: { $in: groups },
    student: { $in: studentIds },
  }).select({ _id: 1 });

  return !!groupStudents.length;
};
