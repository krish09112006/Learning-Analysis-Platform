import { request } from './api';

export const analyticsService = {
  async getAnalytics(studentId, courseId) {
    return request(`analytics?student_id=${studentId}&course_id=${courseId}`);
  }
};

export default analyticsService;
