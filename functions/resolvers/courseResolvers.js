const {
  Course,
  Teacher,
  CourseStudent,
  Student,
  Group,
  GroupStudent,
  Activity,
  Submission,
  GroupActivity,
  GroupSubmission,
} = require("../models/index.js");
const { loginCheck, isCourseStudent, isCourseTeacher } = require("../utils/checks.js");
const generateRandomString = require("../utils/generateRandomString.js");

module.exports = {
  Course: {
    groups: async (course) => ({ data: await Group.find({ course }), pagination: null }),
    students: async (course) => {
      const courseStudents = await CourseStudent.find({ course });
      const filter = {
        _id: {
          $in: courseStudents?.map(({ student }) => student) ?? [],
        },
      };
      return {
        data: await Student.find(filter),
        pagination: null,
      };
    },
    studentCount: async (course) => await CourseStudent.countDocuments({ course }),
    teacher: async (course) => await Teacher.findById(course.teacher),
    courseCode: async (course, _, context) => {
      const courseStudent = await CourseStudent.findOne({ course, student: context.user.id });
      if (!courseStudent && course.teacher != context.user.id) return null;

      return course.courseCode;
    },
    myGroup: async ({ id }, _, context) => {
      const groups = await Group.find({ course: id });
      const groupStudent = await GroupStudent.findOne({
        student: context.user.id,
        group: { $in: groups },
      });

      if (!groupStudent) return null;

      return await Group.findById(groupStudent.group);
    },
  },

  Query: {
    course: async (_, { courseId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      const inCourse = (await isCourseStudent(userId, courseId)) || course.teacher == userId;
      if (!inCourse) throw Error("not in course");

      return course;
    },
    courseFromCourseCode: async (_, { courseCode }, context) => {
      loginCheck(context);

      const course = await Course.findOne({ courseCode }).select({ teacher: 1, courseCode: 1, yearAndSection: 1 });
      if (!course) throw Error("invalid course code");

      return course;
    },
    courses: async (_, { pagination }, context) => {
      loginCheck(context);
      const limit = pagination?.limit ?? 30;
      const page = pagination?.page ?? 1;
      const skip = limit * (page - 1);

      const filter = {};

      const totalCount = await Course.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: await Course.find(filter).skip(skip).limit(limit),
        pagination: {
          totalCount,
          totalPages,
        },
      };
    },
    studentCourses: async (_, __, context) => {
      loginCheck(context);

      const courseStudents = await CourseStudent.find({ student: context.user.id });
      const filter = {
        _id: {
          $in: courseStudents?.map(({ course }) => course) ?? [],
        },
      };

      return {
        data: await Course.find(filter),
        pagination: null,
      };
    },

    teacherCourses: async (_, __, context) => {
      loginCheck(context);

      const filter = { teacher: context.user.id };

      return {
        data: await Course.find(filter),
      };
    },

    studentsWithoutGroup: async (_, { courseId }, context) => {
      loginCheck(context);

      const groups = await Group.find({ course: courseId });
      const courseStudents = await CourseStudent.find({ course: courseId });
      const groupStudents = await GroupStudent.find({
        group: {
          $in: groups?.map(({ id }) => id) ?? [],
        },
      });

      const filter = {
        _id: {
          $in: courseStudents
            ?.map(({ student }) => String(student))
            .filter((id) => {
              return !groupStudents.map(({ student }) => String(student)).includes(id);
            }),
        },
      };

      return {
        data: await Student.find(filter),
      };
    },

    courseActivitiesAndSubmissions: async (_, { courseId, studentId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      if (course.teacher != userId) throw Error("not the course teacher");

      const filter = { course: courseId };

      const activities = await Activity.find(filter).sort({ _id: -1 });
      const submissions = await (async () =>
        Promise.all(
          activities.map((activity) =>
            Submission.findOne({
              activity,
              student: studentId,
            })
          )
        ))();

      const activitiesAndSubmissions = activities.map((activity, index) => ({
        activity,
        submission: submissions[index],
      }));

      const groupStudents = await GroupStudent.find({ student: studentId });
      const group = await Group.findOne({ _id: { $in: groupStudents.map(({ group }) => group) }, course: courseId });

      return {
        group,
        course,
        student: await Student.findById(studentId),
        data: activitiesAndSubmissions,
      };
    },

    courseGroupActivitiesAndGroupSubmissions: async (_, { courseId, groupId }, context) => {
      loginCheck(context);

      const userId = context.user.id;
      const course = await Course.findById(courseId);
      if (!course) return null;

      if (course.teacher != userId) throw Error("not the course teacher");

      const filter = { course: courseId };

      const groupActivities = await GroupActivity.find(filter).sort({ _id: -1 });
      const groupSubmissions = await (async () =>
        Promise.all(
          groupActivities.map((groupActivity) =>
            Submission.findOne({
              groupActivity,
              group: groupId,
            })
          )
        ))();

      const groupActivitiesAndGroupSubmissions = groupActivities.map((groupActivity, index) => ({
        groupActivity,
        groupSubmission: groupSubmissions[index],
      }));

      return {
        group: await Group.findById(groupId),
        course,
        data: groupActivitiesAndGroupSubmissions,
      };
    },
  },

  Mutation: {
    createCourse: async (_, args, context) => {
      loginCheck(context);

      const teacher = await Teacher.findById(context.user.id);
      if (!teacher) throw Error("you must be a teacher to create a course");

      const course = new Course({
        ...args,
        teacher,
      });

      return await course.save();
    },

    joinCourse: async (_, { courseCode }, context) => {
      loginCheck(context);

      const student = await Student.findById(context.user.id);
      if (!student) throw Error("you must be a student to join a course");

      const course = await Course.findOne({ courseCode });
      if (!course) throw Error("invalid course code");

      const courseStudent = await CourseStudent.findOne({
        course,
        student,
      });
      if (courseStudent) throw Error("already in course");

      const newCourseStudent = new CourseStudent({
        student,
        course,
      });
      await newCourseStudent.save();

      return course;
    },

    editCourseInfo: async (_, args, context) => {
      loginCheck(context);

      const courseId = args.courseId;

      if (!(await isCourseTeacher(context.user.id, courseId)))
        throw Error("you must be the teacher of this course to edit the information of the course");

      return await Course.findByIdAndUpdate(
        courseId,
        {
          name: args.name,
          subjCode: args.subjCode,
          yearAndSection: args.yearAndSection,
          courseCode: `${args.subjCode}-${args.yearAndSection}-${generateRandomString(5)}`,
          startsAt: args.startsAt,
          endsAt: args.endsAt,
          isActive: args.isActive,
        },
        { new: true }
      );
    },
  },
};
