const { AuthenticationError } = require("apollo-server-lambda");

const { Course, GroupStudent, CourseStudent, Group } = require("../models/index.js");

module.exports.loginCheck = (context) => {
  if (!context.user) throw new AuthenticationError("you must be logged in");
};

module.exports.isCourseTeacher = async (teacherId, courseId) => {
  if (!courseId) return false;

  const course = await Course.findById(courseId);
  return course.teacher == teacherId;
};

module.exports.isCourseStudent = async (studentId, courseId) => {
  const courseStudent = await CourseStudent.findOne({
    course: courseId,
    student: studentId,
  });

  return !!courseStudent;
};

module.exports.isGroupStudent = async (studentId, groupId) => {
  const groupStudent = await GroupStudent.findOne({
    group: groupId,
    student: studentId,
  });

  return !!groupStudent;
};

module.exports.isGroupLeader = async (studentId, groupId) => {
  const groupStudent = await GroupStudent.findOne({
    group: groupId,
    student: studentId,
    type: "leader",
  });

  return !!groupStudent;
};

module.exports.isCourseStudentMulti = async (studentIds, courseId) => {
  const courseStudents = await CourseStudent.find({
    course: courseId,
    student: {
      $in: studentIds?.map((studentId) => studentId),
    },
  });

  return courseStudents.length === studentIds.length;
};

module.exports.isMemberOfClassGroupMulti = async (studentIds, courseId) => {
  const groups = await Group.find({ course: courseId });
  const groupStudents = await GroupStudent.find({
    group: { $in: groups },
    student: { $in: studentIds },
  });

  return !!groupStudents.length;
};
