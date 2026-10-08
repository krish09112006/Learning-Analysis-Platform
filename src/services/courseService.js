import { request } from './api';

export const courseService = {
  async getAllCourses() {
    return request('courses');
  },

  async getCourse(courseId) {
    return request(`courses?course_id=${courseId}`);
  },

  async addCourse(courseName, description, instructorId) {
    return request('courses', {
      method: 'POST',
      body: { course_name: courseName, description, instructor_id: instructorId }
    });
  },

  async updateCourse(courseId, courseName, description, instructorId) {
    return request('courses', {
      method: 'PUT',
      body: { course_id: courseId, course_name: courseName, description, instructor_id: instructorId }
    });
  },

  async deleteCourse(courseId) {
    return request(`courses?course_id=${courseId}`, {
      method: 'DELETE'
    });
  },

  async enrollInCourse(studentId, courseId) {
    return request('enrollment', {
      method: 'POST',
      body: { student_id: studentId, course_id: courseId }
    });
  },

  async getStudentEnrolledCourses(studentId) {
    return request(`enrollment?student_id=${studentId}`);
  },

  async getCourseTopics(courseId) {
    return request(`topics?course_id=${courseId}`);
  },

  async addTopic(courseId, topicName, category, description, content, topicOrder) {
    return request('topics', {
      method: 'POST',
      body: { course_id: courseId, topic_name: topicName, category, description, content, topic_order: topicOrder }
    });
  },

  async updateTopic(topicId, topicName, category, description, content, topicOrder) {
    return request('topics', {
      method: 'PUT',
      body: { topic_id: topicId, topic_name: topicName, category, description, content, topic_order: topicOrder }
    });
  },

  async deleteTopic(topicId) {
    return request(`topics?topic_id=${topicId}`, {
      method: 'DELETE'
    });
  }
};

export default courseService;
