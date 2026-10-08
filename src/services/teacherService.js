import { request, checkBackendHealth, BASE_URL } from './api';
import courseGeneratorService from './courseGeneratorService';

export const teacherService = {
  // Health & diagnostics
  checkBackendHealth,
  BASE_URL,

  // 1. Dashboard metrics
  async getTeacherAnalytics(instructorId) {
    return request(`teacher_analytics?instructor_id=${instructorId}`);
  },

  // 2. Student roster with analytics
  async getTeacherStudents(instructorId, courseId = '', search = '') {
    let url = `teacher_students?instructor_id=${instructorId}`;
    if (courseId) url += `&course_id=${courseId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request(url);
  },

  // 3. Interventions
  async getInterventions(instructorId) {
    return request(`interventions?instructor_id=${instructorId}`);
  },

  async createIntervention(data) {
    return request('interventions', {
      method: 'POST',
      body: data
    });
  },

  async updateIntervention(interventionId, status, teacherNotes = '') {
    return request('interventions', {
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
    return request(`teacher_reports?instructor_id=${instructorId}&type=${type}`);
  },

  getCsvReportUrl(instructorId, type = 'course_progress') {
    return `${BASE_URL}teacher_reports?instructor_id=${instructorId}&type=${type}&format=csv`;
  },

  // 5. Courses CRUD, Structure Builder, Smart Course Builder & Duplication
  async getTeacherCourses() {
    return request('teacher_courses');
  },

  async getTeacherCourseById(courseId) {
    return request(`teacher_courses?id=${courseId}`);
  },

  async saveCourseDraft(coursePayload) {
    return request('teacher_courses', {
      method: 'POST',
      body: {
        action: 'save_draft',
        force_draft: true,
        ...coursePayload
      }
    });
  },

  async publishCourse(coursePayload) {
    return request('teacher_courses', {
      method: 'POST',
      body: {
        action: 'publish',
        ...coursePayload
      }
    });
  },

  async archiveCourse(courseId) {
    return request('teacher_courses', {
      method: 'POST',
      body: {
        action: 'archive',
        id: courseId
      }
    });
  },

  async duplicateBuilderCourse(courseId) {
    return request('teacher_courses', {
      method: 'POST',
      body: {
        action: 'duplicate',
        id: courseId
      }
    });
  },

  async deleteBuilderCourse(courseId) {
    return request(`teacher_courses?id=${courseId}`, {
      method: 'DELETE'
    });
  },

  async generateCourseDraft(inputPayload) {
    const res = await courseGeneratorService.generateCourse(inputPayload);
    return { draft: res.course };
  },

  async regenerateCourseSection(sectionType, params) {
    if (sectionType === 'module') {
      return { generated: await courseGeneratorService.regenerateModule(params.modIndex || 1, params.module_name, [params.module_name], params.difficulty) };
    } else if (sectionType === 'topic') {
      return { generated: await courseGeneratorService.regenerateTopic({}, params.module_name, params.topic_name, params.difficulty) };
    }
    // Fallback
    return request('teacher_courses', {
      method: 'POST',
      body: {
        action: 'generate_section',
        section_type: sectionType,
        ...params
      }
    });
  },

  async getCourses(instructorId) {
    let url = 'courses';
    if (instructorId) url += `?instructor_id=${instructorId}`;
    return request(url);
  },

  async getCourseDetails(courseId) {
    return request(`courses?course_id=${courseId}`);
  },

  async createCourse(courseData) {
    return request('courses', {
      method: 'POST',
      body: courseData
    });
  },

  async updateCourse(courseData) {
    return request('courses', {
      method: 'PUT',
      body: courseData
    });
  },

  async deleteCourse(courseId) {
    return request(`courses?course_id=${courseId}`, {
      method: 'DELETE'
    });
  },

  async duplicateCourse(courseId, instructorId) {
    return request('courses', {
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
    return request(`topics?course_id=${courseId}`);
  },

  async createTopic(topicData) {
    return request('topics', {
      method: 'POST',
      body: topicData
    });
  },

  async updateTopic(topicData) {
    return request('topics', {
      method: 'PUT',
      body: topicData
    });
  },

  async deleteTopic(topicId) {
    return request(`topics?topic_id=${topicId}`, {
      method: 'DELETE'
    });
  },

  async reorderTopics(orders) {
    return request('topics', {
      method: 'POST',
      body: {
        action: 'reorder',
        orders
      }
    });
  },

  // 7. Course Materials
  async getMaterials(courseId, topicId = '') {
    let url = `materials?course_id=${courseId}`;
    if (topicId) url += `&topic_id=${topicId}`;
    return request(url);
  },

  async addMaterial(materialData) {
    return request('materials', {
      method: 'POST',
      body: materialData
    });
  },

  async deleteMaterial(materialId) {
    return request(`materials?material_id=${materialId}`, {
      method: 'DELETE'
    });
  },

  // 8. Quizzes CRUD & Duplication & Analytics
  async getQuizzes(courseId = '', topicId = '') {
    let url = 'quizzes';
    const params = [];
    if (courseId) params.push(`course_id=${courseId}`);
    if (topicId) params.push(`topic_id=${topicId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request(url);
  },

  async getQuizAnalytics(quizId) {
    return request(`quizzes?quiz_id=${quizId}&analytics=1`);
  },

  async createQuiz(quizData) {
    return request('quizzes', {
      method: 'POST',
      body: quizData
    });
  },

  async duplicateQuiz(quizId) {
    return request('quizzes', {
      method: 'POST',
      body: {
        action: 'duplicate',
        quiz_id: quizId
      }
    });
  },

  async updateQuiz(quizData) {
    return request('quizzes', {
      method: 'PUT',
      body: quizData
    });
  },

  async deleteQuiz(quizId) {
    return request(`quizzes?quiz_id=${quizId}`, {
      method: 'DELETE'
    });
  },

  async generateQuiz(params) {
    return request('generate_quiz', {
      method: 'POST',
      body: params
    });
  },

  // 9. Questions CRUD
  async addQuestion(questionData) {
    return request('questions', {
      method: 'POST',
      body: questionData
    });
  },

  async updateQuestion(questionData) {
    return request('questions', {
      method: 'PUT',
      body: questionData
    });
  },

  async deleteQuestion(questionId) {
    return request(`questions?question_id=${questionId}`, {
      method: 'DELETE'
    });
  },

  // 10. Assignments & Grading
  async getAssignments(courseId = '', topicId = '') {
    let url = 'assignments';
    const params = [];
    if (courseId) params.push(`course_id=${courseId}`);
    if (topicId) params.push(`topic_id=${topicId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request(url);
  },

  async createAssignment(assignmentData) {
    return request('assignments', {
      method: 'POST',
      body: assignmentData
    });
  },

  async updateAssignment(assignmentData) {
    return request('assignments', {
      method: 'PUT',
      body: assignmentData
    });
  },

  async deleteAssignment(assignmentId) {
    return request(`assignments?assignment_id=${assignmentId}`, {
      method: 'DELETE'
    });
  },

  async getSubmissions(assignmentId = '', studentId = '') {
    let url = 'assignment_submissions';
    const params = [];
    if (assignmentId) params.push(`assignment_id=${assignmentId}`);
    if (studentId) params.push(`student_id=${studentId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return request(url);
  },

  async gradeSubmission(submissionId, marksAwarded, feedback = '') {
    return request('assignment_submissions', {
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
    return request(`notifications?user_id=${userId}`);
  },

  async markNotificationRead(notificationId) {
    return request('notifications', {
      method: 'POST',
      body: {
        action: 'mark_read',
        notification_id: notificationId
      }
    });
  },

  async markAllNotificationsRead(userId) {
    return request('notifications', {
      method: 'POST',
      body: {
        action: 'mark_all_read',
        user_id: userId
      }
    });
  }
};

export default teacherService;
