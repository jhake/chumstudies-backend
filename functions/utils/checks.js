const { AuthenticationError } = require("apollo-server-lambda");

const { Course, GroupStudent, CourseStudent } = require("../models/index.js");

module.exports.loginCheck = (context) => {
  if (!context.user) throw new AuthenticationError("you must be logged in");
};

module.exports.isCourseTeacher = async (teacherId, courseId) => {
  const course = await Course.findById(courseId);
  return course.teacher === teacherId;
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
