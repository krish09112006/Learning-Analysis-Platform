import { request } from './api';

export const analyticsService = {
  async getAnalytics(studentId, courseId) {
    return request(`analytics.php?student_id=${studentId}&course_id=${courseId}`);
  }
};

export default analyticsService;
