import { request } from './api';

export const assignmentService = {
  async getAssignments(courseId = '', topicId = '') {
    let url = 'assignments.php?';
    if (courseId) url += `course_id=${courseId}&`;
    if (topicId) url += `topic_id=${topicId}&`;
    return request(url);
  },

  async getAssignment(assignmentId) {
    return request(`assignments.php?assignment_id=${assignmentId}`);
  },

  async createAssignment(data) {
    return request('assignments.php', {
      method: 'POST',
      body: data
    });
  },

  async updateAssignment(data) {
    return request('assignments.php', {
      method: 'PUT',
      body: data
    });
  },

  async deleteAssignment(assignmentId) {
    return request(`assignments.php?assignment_id=${assignmentId}`, {
      method: 'DELETE'
    });
  },

  async getSubmissions(assignmentId = '', studentId = '') {
    let url = 'assignment_submissions.php?';
    if (assignmentId) url += `assignment_id=${assignmentId}&`;
    if (studentId) url += `student_id=${studentId}&`;
    return request(url);
  },

  async submitAssignment(data) {
    return request('assignment_submissions.php', {
      method: 'POST',
      body: data
    });
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
  }
};

export default assignmentService;
