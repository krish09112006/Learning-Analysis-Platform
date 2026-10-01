import { request } from './api';

export const courseService = {
  async getAllCourses() {
    return request('courses.php');
  },

  async getCourse(courseId) {
    return request(`courses.php?course_id=${courseId}`);
  },

  async addCourse(courseName, description, instructorId) {
    return request('courses.php', {
      method: 'POST',
      body: { course_name: courseName, description, instructor_id: instructorId }
    });
  },

  async updateCourse(courseId, courseName, description, instructorId) {
    return request('courses.php', {
      method: 'PUT',
      body: { course_id: courseId, course_name: courseName, description, instructor_id: instructorId }
    });
  },

  async deleteCourse(courseId) {
    return request(`courses.php?course_id=${courseId}`, {
      method: 'DELETE'
    });
  },

  async enrollInCourse(studentId, courseId) {
    return request('enrollment.php', {
      method: 'POST',
      body: { student_id: studentId, course_id: courseId }
    });
  },

  async getStudentEnrolledCourses(studentId) {
    return request(`enrollment.php?student_id=${studentId}`);
  },

  async getCourseTopics(courseId) {
    return request(`topics.php?course_id=${courseId}`);
  },

  async addTopic(courseId, topicName, category, description, content, topicOrder) {
    return request('topics.php', {
      method: 'POST',
      body: { course_id: courseId, topic_name: topicName, category, description, content, topic_order: topicOrder }
    });
  },

  async updateTopic(topicId, topicName, category, description, content, topicOrder) {
    return request('topics.php', {
      method: 'PUT',
      body: { topic_id: topicId, topic_name: topicName, category, description, content, topic_order: topicOrder }
    });
  },

  async deleteTopic(topicId) {
    return request(`topics.php?topic_id=${topicId}`, {
      method: 'DELETE'
    });
  }
};

export default courseService;
