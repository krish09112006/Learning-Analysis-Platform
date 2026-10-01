import { request } from './api';

export const timelineService = {
  // Learning Timeline
  async getTimeline(studentId, courseId = '') {
    let url = `timeline.php?student_id=${studentId}`;
    if (courseId) url += `&course_id=${courseId}`;
    return request(url);
  },

  async logEvent(studentId, courseId, eventType, eventTitle, eventDescription = '', metadata = null) {
    return request('timeline.php', {
      method: 'POST',
      body: {
        student_id: studentId,
        course_id: courseId,
        event_type: eventType,
        event_title: eventTitle,
        event_description: eventDescription,
        metadata
      }
    });
  },

  // Smart Revision Queue
  async getRevisionQueue(studentId) {
    return request(`revision_queue.php?student_id=${studentId}`);
  },

  async markRevisionCompleted(studentId, topicId, courseId) {
    return request('revision_queue.php', {
      method: 'POST',
      body: {
        student_id: studentId,
        topic_id: topicId,
        course_id: courseId
      }
    });
  },

  // Topic Mastery Map
  async getTopicMastery(studentId, courseId) {
    return request(`topic_mastery.php?student_id=${studentId}&course_id=${courseId}`);
  }
};

export default timelineService;
