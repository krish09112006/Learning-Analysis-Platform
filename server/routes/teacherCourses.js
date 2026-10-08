import express from 'express';
import pool, { query } from '../db.js';

const router = express.Router();

const getTeacherId = (req) => 2; // Default to Dr. Alok Verma

router.get('/', async (req, res) => {
  const teacherId = getTeacherId(req);
  try {
    if (req.query.id) {
      const courseId = parseInt(req.query.id);
      const courseRes = await query('SELECT * FROM courses WHERE course_id = $1', [courseId]);
      if (courseRes.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      let course = courseRes.rows[0];
      course.id = course.course_id;
      course.course_name = course.course_name || course.title;
      course.difficulty = course.difficulty || course.difficulty_level || 'Beginner';
      
      // Fetch modules
      const modRes = await query('SELECT * FROM course_modules WHERE course_id = $1 ORDER BY order_index ASC', [courseId]);
      let modules = modRes.rows;
      
      for (let mod of modules) {
        mod.id = mod.module_id;
        mod.module_name = mod.title;
        if (typeof mod.learning_objectives === 'string') {
          try { mod.learning_objectives = JSON.parse(mod.learning_objectives); } catch(e){}
        }
        
        // Fetch topics for module
        const topRes = await query('SELECT * FROM course_topics WHERE module_id = $1 ORDER BY order_index ASC', [mod.module_id]);
        mod.topics = topRes.rows.map(t => ({
          ...t,
          id: t.topic_id,
          topic_name: t.title,
          examples: t.code_example || '',
          quizzes: []
        }));
      }
      
      course.modules = modules;
      res.json(course);
    } else {
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

router.post('/', async (req, res) => {
  const teacherId = getTeacherId(req);
  const data = req.body;
  const action = data.action || 'save_draft';
  
  if (action === 'save_draft' || action === 'publish') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const status = action === 'publish' ? 'Published' : 'Draft';
      const courseName = data.course_name || data.title || 'Untitled Course';
      const desc = data.description || '';
      const diff = data.difficulty || data.difficulty_level || 'Beginner';
      const category = data.category || 'Computer Science';
      const duration = data.duration || '8 Weeks';
      let courseId = data.id || data.course_id;
      
      const objStr = Array.isArray(data.learning_objectives) ? JSON.stringify(data.learning_objectives) : data.learning_objectives;

      if (courseId) {
        await client.query(`
          UPDATE courses SET 
            course_name = $1, title = $2, description = $3, difficulty = $4, difficulty_level = $5,
            status = $6, category = $7, duration = $8, learning_objectives = $9, updated_at = CURRENT_TIMESTAMP
          WHERE course_id = $10
        `, [courseName, courseName, desc, diff, diff, status, category, duration, objStr, courseId]);
        
        await client.query('DELETE FROM course_modules WHERE course_id = $1', [courseId]);
      } else {
        const insRes = await client.query(`
          INSERT INTO courses (instructor_id, teacher_id, course_name, title, description, difficulty, difficulty_level, status, category, duration, learning_objectives)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING course_id
        `, [teacherId, teacherId, courseName, courseName, desc, diff, diff, status, category, duration, objStr]);
        courseId = insRes.rows[0].course_id;
      }

      // Modules
      if (data.modules && Array.isArray(data.modules)) {
        for (let i = 0; i < data.modules.length; i++) {
          const mod = data.modules[i];
          const mTitle = mod.module_name || mod.title || 'Untitled Module';
          const modIns = await client.query(`
            INSERT INTO course_modules (course_id, title, description, order_index, duration, difficulty)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING module_id
          `, [courseId, mTitle, mod.description || '', i, mod.duration || '2 Weeks', mod.difficulty || diff]);
          
          const modId = modIns.rows[0].module_id;
          
          if (mod.topics && Array.isArray(mod.topics)) {
            for (let j = 0; j < mod.topics.length; j++) {
              const top = mod.topics[j];
              await client.query(`
                INSERT INTO course_topics (module_id, title, content, code_example, order_index, important_concepts, duration, difficulty)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `, [modId, top.topic_name || top.title || 'Untitled Topic', top.content || top.description || '', top.examples || top.code_example || '', j, top.important_concepts || '', top.duration || '45 mins', top.difficulty || diff]);
            }
          }
        }
      }
      
      await client.query('COMMIT');
      res.json({ status: 'success', message: 'Course saved', course: { id: courseId, course_name: courseName } });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Failed to save course: ' + err.message });
    } finally {
      client.release();
    }
  } else if (action === 'delete') {
      await query('DELETE FROM courses WHERE course_id = $1', [data.id]);
      res.json({ status: 'success' });
  } else {
    res.json({ status: 'success', message: 'Action not fully implemented' });
  }
});

router.delete('/', async (req, res) => {
    if (req.query.id) {
        await query('DELETE FROM courses WHERE course_id = $1', [req.query.id]);
        res.json({ status: 'success' });
    } else {
        res.status(400).json({ error: 'Missing ID' });
    }
});

export default router;
