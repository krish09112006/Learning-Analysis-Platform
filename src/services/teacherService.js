import { request, checkBackendHealth, BASE_URL } from './api';

export const teacherService = {
  // Health & diagnostics
  checkBackendHealth,
  BASE_URL,

  // 1. Dashboard metrics
  async getTeacherAnalytics(instructorId) {
    return request(`teacher_analytics.php?instructor_id=${instructorId}`);
  },

  // 2. Student roster with analytics
  async getTeacherStudents(instructorId, courseId = '', search = '') {
    let url = `teacher_students.php?instructor_id=${instructorId}`;
    if (courseId) url += `&course_id=${courseId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request(url);
  },

  // 3. Interventions
  async getInterventions(instructorId) {
    return request(`interventions.php?instructor_id=${instructorId}`);
  },

  async createIntervention(data) {
    return request('interventions.php', {
      method: 'POST',
      body: data
    });
  },

  async updateIntervention(interventionId, status, teacherNotes = '') {
    return request('interventions.php', {
      method: 'PUT',
      body: {
        intervention_id: interventionId,
        status,
        teacher_notes: teacherNotes
      }
    });
  },

  // 4. Reports & Exports
  async getReports(instructorId, type = 'course_progress') {
    return request(`teacher_reports.php?instructor_id=${instructorId}&type=${type}`);
  },

  getCsvReportUrl(instructorId, type = 'course_progress') {
    return `${BASE_URL}teacher_reports.php?instructor_id=${instructorId}&type=${type}&format=csv`;
  },

  // 5. Courses CRUD, Structure Builder, Smart Course Builder & Duplication
  async getTeacherCourses() {
    return request('teacher_courses.php');
  },

  async getTeacherCourseById(courseId) {
    return request(`teacher_courses.php?id=${courseId}`);
  },

  async saveCourseDraft(coursePayload) {
    return request('teacher_courses.php', {
      method: 'POST',
      body: {
        action: 'save_draft',
        force_draft: true,
        ...coursePayload
      }
    });
  },

  async publishCourse(coursePayload) {
    return request('teacher_courses.php', {
      method: 'POST',
      body: {
        action: 'publish',
        ...coursePayload
      }
    });
  },

  async archiveCourse(courseId) {
    return request('teacher_courses.php', {
      method: 'POST',
      body: {
        action: 'archive',
        id: courseId
      }
    });
  },

  async duplicateBuilderCourse(courseId) {
    return request('teacher_courses.php', {
      method: 'POST',
      body: {
        action: 'duplicate',
        id: courseId
      }
    });
  },

  async deleteBuilderCourse(courseId) {
    return request(`teacher_courses.php?id=${courseId}`, {
      method: 'DELETE'
    });
  },

  async generateCourseDraft(inputPayload) {
    return request('teacher_courses.php', {
      method: 'POST',
      body: {
        action: 'generate_course',
        ...inputPayload
      }
    });
  },

  async regenerateCourseSection(sectionType, params) {
    return request('teacher_courses.php', {
      method: 'POST',
      body: {
        action: 'generate_section',
        section_type: sectionType,
        ...params
      }
    });
  },

  async getCourses(instructorId) {
    let url = 'courses.php';
    if (instructorId) url += `?instructor_id=${instructorId}`;
    return request(url);
  },

  async getCourseDetails(courseId) {
    return request(`courses.php?course_id=${courseId}`);
  },

  async createCourse(courseData) {
    return request('courses.php', {
      method: 'POST',
      body: courseData
    });
  },

  async updateCourse(courseData) {
    return request('courses.php', {
      method: 'PUT',
      body: courseData
    });
  },

  async deleteCourse(courseId) {
    return request(`courses.php?course_id=${courseId}`, {
      method: 'DELETE'
    });
  },

  async duplicateCourse(courseId, instructorId) {
    return request('courses.php', {
      method: 'POST',
      body: {
        action: 'duplicate',
        course_id: courseId,
        instructor_id: instructorId
      }
    });
  },

  // 6. Topics & Curriculum Builder
  async getCourseTopics(courseId) {
    return request(`topics.php?course_id=${courseId}`);
  },

  async createTopic(topicData) {
    return request('topics.php', {
      method: 'POST',
      body: topicData
    });
  },

  async updateTopic(topicData) {
    return request('topics.php', {
      method: 'PUT',
      body: topicData
    });
  },

  async deleteTopic(topicId) {
    return request(`topics.php?topic_id=${topicId}`, {
      method: 'DELETE'
    });
  },

  async reorderTopics(orders) {
    return request('topics.php', {
      method: 'POST',
      body: {
        action: 'reorder',
        orders
      }
    });
  },

  // 7. Course Materials
  async getMaterials(courseId, topicId = '') {
    let url = `materials.php?course_id=${courseId}`;
    if (topicId) url += `&topic_id=${topicId}`;
    return request(url);
  },

  async addMaterial(materialData) {
    return request('materials.php', {
      method: 'POST',
      body: materialData
    });
  },

  async deleteMaterial(materialId) {
    return request(`materials.php?material_id=${materialId}`, {
      method: 'DELETE'
    });
  },

  // 8. Quizzes CRUD & Duplication & Analytics
  async getQuizzes(courseId = '', topicId = '') {
    let url = 'quizzes.php';
    const params = [];
    if (courseId) params.push(`course_id=${courseId}`);
    if (topicId) params.push(`topic_id=${topicId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request(url);
  },

  async getQuizAnalytics(quizId) {
    return request(`quizzes.php?quiz_id=${quizId}&analytics=1`);
  },

  async createQuiz(quizData) {
    return request('quizzes.php', {
      method: 'POST',
      body: quizData
    });
  },

  async duplicateQuiz(quizId) {
    return request('quizzes.php', {
      method: 'POST',
      body: {
        action: 'duplicate',
        quiz_id: quizId
      }
    });
  },

  async updateQuiz(quizData) {
    return request('quizzes.php', {
      method: 'PUT',
      body: quizData
    });
  },

  async deleteQuiz(quizId) {
    return request(`quizzes.php?quiz_id=${quizId}`, {
      method: 'DELETE'
    });
  },

  async generateQuiz(params) {
    return request('generate_quiz.php', {
      method: 'POST',
      body: params
    });
  },

  // 9. Questions CRUD
  async addQuestion(questionData) {
    return request('questions.php', {
      method: 'POST',
      body: questionData
    });
  },

  async updateQuestion(questionData) {
    return request('questions.php', {
      method: 'PUT',
      body: questionData
    });
  },

  async deleteQuestion(questionId) {
    return request(`questions.php?question_id=${questionId}`, {
      method: 'DELETE'
    });
  },

  // 10. Assignments & Grading
  async getAssignments(courseId = '', topicId = '') {
    let url = 'assignments.php';
    const params = [];
    if (courseId) params.push(`course_id=${courseId}`);
    if (topicId) params.push(`topic_id=${topicId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request(url);
  },

  async createAssignment(assignmentData) {
    return request('assignments.php', {
      method: 'POST',
      body: assignmentData
    });
  },

  async updateAssignment(assignmentData) {
    return request('assignments.php', {
      method: 'PUT',
      body: assignmentData
    });
  },

  async deleteAssignment(assignmentId) {
    return request(`assignments.php?assignment_id=${assignmentId}`, {
      method: 'DELETE'
    });
  },

  async getSubmissions(assignmentId = '', studentId = '') {
    let url = 'assignment_submissions.php';
    const params = [];
    if (assignmentId) params.push(`assignment_id=${assignmentId}`);
    if (studentId) params.push(`student_id=${studentId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request(url);
  },

  async gradeSubmission(submissionId, marksAwarded, feedback = '') {
    return request('assignment_submissions.php', {
      method: 'PUT',
      body: {
        submission_id: submissionId,
        marks_awarded: marksAwarded,
        feedback
      }
    });
  },

  // 11. Notifications
  async getNotifications(userId) {
    return request(`notifications.php?user_id=${userId}`);
  },

  async markNotificationRead(notificationId) {
    return request('notifications.php', {
      method: 'POST',
      body: {
        action: 'mark_read',
        notification_id: notificationId
      }
    });
  },

  async markAllNotificationsRead(userId) {
    return request('notifications.php', {
      method: 'POST',
      body: {
        action: 'mark_all_read',
        user_id: userId
      }
    });
  }
};

export default teacherService;
