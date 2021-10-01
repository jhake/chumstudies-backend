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

    uploadPreset: String
    isAdmin: Boolean
    student: Student
    teacher: Teacher
  }

  type UsersResult {
    data: [User]
    pagination: Pagination
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
    groups: GroupsResult
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
    course: Course
    students: StudentsResult
    leader: Student
    admins: StudentsResult
    type: GroupType
  }

  enum GroupType {
    CLASS
    STUDY
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
    dueAt: Date
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
    dueAt: Date
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
    dueAt: Date
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
    comments: CommentsResult
    activity: Activity
    groupActivity: GroupActivity
  }

  type PostsResult {
    data: [Post]
    pagination: Pagination
  }

  type File {
    attachment: String
    user: User
  }

  type FilesResult {
    postData: [File]
    activityData: [File]
    groupActivityData: [File]
    pagination: Pagination
  }

  type Comment {
    id: ID
    content: String
    score: Int
    createdAt: Date
    user: User
    post: Post
    vote: Int
  }

  type CommentsResult {
    data: [Comment]
    pagination: Pagination
  }
`;
