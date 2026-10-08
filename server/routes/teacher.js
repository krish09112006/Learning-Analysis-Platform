import express from 'express';
import pool, { query } from '../db.js';

const router = express.Router();

// Fallback user ID for now
const getTeacherId = (req) => {
  return 2; // Default to Dr. Alok Verma
};

// GET /api/teacher/teacher_courses
router.get('/teacher_courses', async (req, res) => {
  const teacherId = getTeacherId(req);
  try {
    if (req.query.id) {
      // Get single course details
      const courseId = parseInt(req.query.id);
      const courseRes = await query('SELECT * FROM courses WHERE course_id = $1', [courseId]);
      if (courseRes.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      let course = courseRes.rows[0];

      // Format response to match PHP format
      course.id = course.course_id;
      course.course_name = course.course_name || course.title;
      course.difficulty = course.difficulty || course.difficulty_level || 'Beginner';
      course.modules = []; // Mock modules for now to avoid breaking UI

      res.json(course);
    } else {
      // List courses
      const result = await query(`
        SELECT c.*,
          (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) as enrolled_count,
          (SELECT COUNT(*) FROM course_modules WHERE course_id = c.course_id) as modules_count,
          (SELECT COUNT(*) FROM topics WHERE course_id = c.course_id) as topics_count
        FROM courses c
        WHERE c.teacher_id = $1 OR c.instructor_id = $1
        ORDER BY c.created_at DESC
      `, [teacherId]);

      const courses = result.rows.map(c => ({
        ...c,
        id: c.course_id,
        course_name: c.course_name || c.title,
        title: c.course_name || c.title,
        difficulty: c.difficulty || c.difficulty_level || 'Beginner'
      }));

      res.json(courses);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teacher/teacher_courses
router.post('/teacher_courses', async (req, res) => {
  // Mock response for saving/publishing courses
  res.json({ status: 'success', message: 'Course action successful (Node backend).' });
});

// Mock other endpoints that Teacher module hits
router.get('/teacher_analytics', (req, res) => res.json({}));
router.get('/interventions', (req, res) => res.json([]));
router.get('/quizzes', (req, res) => res.json([]));
router.get('/questions', (req, res) => res.json([]));
router.get('/teacher_reports', (req, res) => res.json([]));

export default router;
