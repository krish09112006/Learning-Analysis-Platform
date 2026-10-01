import { request } from './api';

export const quizService = {
  async getQuizzes(courseId = '', topicId = '') {
    const params = [];
    if (courseId) params.push(`course_id=${encodeURIComponent(courseId)}`);
    if (topicId) params.push(`topic_id=${encodeURIComponent(topicId)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return request(`quizzes.php${query}`);
  },

  async getQuizById(quizId, studentMode = false) {
    const sm = studentMode ? '&student_mode=1' : '';
    return request(`quizzes.php?quiz_id=${encodeURIComponent(quizId)}${sm}`);
  },

  async getQuizAnalytics(quizId) {
    return request(`quizzes.php?quiz_id=${encodeURIComponent(quizId)}&analytics=1`);
  },

  async getQuestions(quizId) {
    return request(`questions.php?quiz_id=${encodeURIComponent(quizId)}`);
  },

  async createQuiz(quizData) {
    return request('quizzes.php', {
      method: 'POST',
      body: {
        action: 'create',
        ...quizData
      }
    });
  },

  async updateQuiz(quizData) {
    return request('quizzes.php', {
      method: 'PUT',
      body: quizData
    });
  },

  async publishQuiz(quizId) {
    return request('quizzes.php', {
      method: 'POST',
      body: {
        action: 'publish',
        quiz_id: quizId
      }
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

  async deleteQuiz(quizId) {
    return request(`quizzes.php?quiz_id=${encodeURIComponent(quizId)}`, {
      method: 'DELETE'
    });
  },

  async generateSmartQuizDraft(params) {
    return request('quizzes.php', {
      method: 'POST',
      body: {
        action: 'generate_draft',
        ...params
      }
    });
  },

  async regenerateQuizQuestion(params) {
    return request('quizzes.php', {
      method: 'POST',
      body: {
        action: 'regenerate_question',
        ...params
      }
    });
  },

  // Topic-Based Question Bank Methods
  async getQuestionBank(filters = {}) {
    const params = [];
    if (filters.course_id) params.push(`course_id=${encodeURIComponent(filters.course_id)}`);
    if (filters.topic_id) params.push(`topic_id=${encodeURIComponent(filters.topic_id)}`);
    if (filters.question_type && filters.question_type !== 'All') params.push(`question_type=${encodeURIComponent(filters.question_type)}`);
    if (filters.difficulty && filters.difficulty !== 'All') params.push(`difficulty=${encodeURIComponent(filters.difficulty)}`);
    if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return request(`question_bank.php${query}`);
  },

  async saveToQuestionBank(questionItem) {
    return request('question_bank.php', {
      method: 'POST',
      body: questionItem
    });
  },

  async updateQuestionBankItem(questionItem) {
    return request('question_bank.php', {
      method: 'PUT',
      body: questionItem
    });
  },

  async deleteQuestionBankItem(id) {
    return request(`question_bank.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  async copyBankQuestionsToQuiz(quizId, bankIds) {
    return request('question_bank.php', {
      method: 'POST',
      body: {
        action: 'copy_to_quiz',
        quiz_id: quizId,
        bank_ids: bankIds
      }
    });
  },

  async submitQuiz(studentId, quizId, answers, timeTaken = 30) {
    return request('quiz_results.php', {
      method: 'POST',
      body: {
        student_id: studentId,
        quiz_id: quizId,
        answers,
        time_taken: timeTaken
      }
    });
  },

  async getQuizResults(studentId, quizId = '') {
    const quizParam = quizId ? `&quiz_id=${quizId}` : '';
    return request(`quiz_results.php?student_id=${studentId}${quizParam}`);
  }
};

export default quizService;
