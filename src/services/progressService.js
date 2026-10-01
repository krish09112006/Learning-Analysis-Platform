import { request } from './api';

export const progressService = {
  async getProgress(studentId, courseId = '') {
    const courseParam = courseId ? `&course_id=${courseId}` : '';
    return request(`progress.php?student_id=${studentId}${courseParam}`);
  },

  async saveProgress(studentId, courseId, topicId, completionStatus, completionPercentage = null, timeSpent = 0) {
    return request('progress.php', {
      method: 'POST',
      body: {
        student_id: studentId,
        course_id: courseId,
        topic_id: topicId,
        completion_status: completionStatus,
        completion_percentage: completionPercentage,
        time_spent: timeSpent
      }
    });
  }
};

export default progressService;
