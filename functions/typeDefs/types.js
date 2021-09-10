const { gql } = require("apollo-server-lambda");

module.exports = gql`
  scalar Date

  type Pagination {
    totalCount: Int
    totalPages: Int
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  type User {
    firstName: String
    middleName: String
    lastName: String
    schoolIdNumber: String
    profilePicture: String

    private: UserPrivate
    student: Student
    teacher: Teacher
  }

  type UsersResult {
    data: [User]
    pagination: Pagination
  }

  type UserPrivate {
    uploadPreset: String
  }

  type Student {
    id: ID
    user: User
    courses: CoursesResult
    groups: GroupsResult
    submissions: SubmissionsResult
    tasks: TasksResult
  }

  type StudentsResult {
    data: [Student]
    pagination: Pagination
  }

  type Teacher {
    id: ID
    user: User
    courses: CoursesResult
  }

  type Course {
    id: ID
    name: String
    subjCode: String
    courseCode: String
    yearAndSection: String
    startsAt: Date
    endsAt: Date
    isActive: Boolean
    students: StudentsResult
    teacher: Teacher
    activities: ActivitiesResult
    groupActivities: GroupActivitiesResult
  }

  type CoursesResult {
    data: [Course]
    pagination: Pagination
  }

  type Group {
    id: ID
    name: String
    groupCode: String
    isActive: Boolean
    type: String
    course: Course
    students: StudentsResult
    leader: Student
    admins: StudentsResult
  }

  type GroupsResult {
    data: [Group]
    pagination: Pagination
  }

  type Activity {
    id: ID
    title: String
    description: String
    attachment: String
    dueDate: Date
    type: String
    course: Course
    submissions: SubmissionsResult
  }

  type ActivitiesResult {
    data: [Activity]
    pagination: Pagination
  }

  type GroupActivity {
    id: ID
    title: String
    description: String
    attachment: String
    dueDate: Date
    course: Course
    submissions: GroupSubmissionsResult
  }

  type GroupActivitiesResult {
    data: [GroupActivity]
    pagination: Pagination
  }

  type Submission {
    id: ID
    description: String
    grade: Int
    submittedAt: Date
    student: Student
    activity: Activity
  }

  type SubmissionsResult {
    data: [Submission]
    pagination: Pagination
  }

  type GroupSubmission {
    id: ID
    attachment: String
    description: String
    grade: Int
    submittedAt: Date
    group: Group
    groupActivity: GroupActivity
  }

  type GroupSubmissionsResult {
    data: [GroupSubmission]
    pagination: Pagination
  }

  type Task {
    id: ID
    attachment: String
    description: String
    grade: Int
    dueDate: Date
    progress: Int
    student: Student
    groupSubmission: GroupSubmission
  }

  type TasksResult {
    data: [Task]
    pagination: Pagination
  }

  type Post {
    id: ID
    content: String
    attachment: String
    category: String
    createdAt: Date
    tags: [String]
    user: User
    course: Course
    group: Group
  }

  type Comment {
    id: ID
    content: String
    score: Int
    createdAt: Date
    user: User
    post: Post
  }
`;
