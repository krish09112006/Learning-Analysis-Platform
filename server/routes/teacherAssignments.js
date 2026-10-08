import express from 'express';
import pool, { query } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const courseId = req.query.course_id;
    let sql = `
      SELECT a.*, c.course_name, c.title as course_title, t.title as topic_name
      FROM assignments a
      LEFT JOIN courses c ON a.course_id = c.course_id
      LEFT JOIN course_topics t ON a.topic_id = t.topic_id
    `;
    const params = [];
    if (courseId) {
      sql += ' WHERE a.course_id = $1';
      params.push(courseId);
    }
    sql += ' ORDER BY a.created_at DESC';

    const result = await query(sql, params);
    const assignments = result.rows.map(a => ({
      ...a,
      id: a.assignment_id,
      course_name: a.course_name || a.course_title,
      topic_name: a.topic_name,
      total_submissions: 0,
      submission_count: 0
    }));
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const data = req.body;
  try {
    const courseId = data.course_id || null;
    const topicId = data.topic_id || null;
    const moduleId = data.module_id || null;
    const title = data.title || 'Untitled';
    const desc = data.description || '';
    const inst = data.instructions || '';
    const maxMarks = data.max_marks || 100;
    const passingMarks = data.passing_marks || 50;
    const status = data.status || 'Draft';
    const subType = data.submission_type || 'File Upload';
    const refFile = data.reference_file || data.attachment || null;
    const topicName = data.topic_name || null;
    
    // basic date handling for postgres timestamp
    const startAt = data.start_at || null;
    const dueAt = data.due_at || null;

    const insRes = await query(`
      INSERT INTO assignments 
      (course_id, topic_id, topic_name, module_id, title, description, instructions, max_marks, total_marks, passing_marks, status, submission_type, reference_file, start_at, due_at, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING assignment_id
    `, [courseId, topicId, topicName, moduleId, title, desc, inst, maxMarks, maxMarks, passingMarks, status, subType, refFile, startAt, dueAt, dueAt ? dueAt.slice(0,10) : null]);
    
    res.json({ status: 'success', assignment_id: insRes.rows[0].assignment_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create assignment: ' + err.message });
  }
});

router.put('/', async (req, res) => {
  const data = req.body;
  const aid = data.assignment_id || data.id;
  if (!aid) return res.status(400).json({ error: 'ID required' });
  
  try {
    const title = data.title || 'Untitled';
    const desc = data.description || '';
    const inst = data.instructions || '';
    const maxMarks = data.max_marks || 100;
    const status = data.status || 'Draft';
    const refFile = data.reference_file || data.attachment || null;
    const topicName = data.topic_name || null;
    const startAt = data.start_at || null;
    const dueAt = data.due_at || null;

    await query(`
      UPDATE assignments SET 
      title = $1, description = $2, instructions = $3, max_marks = $4, status = $5, reference_file = COALESCE($6, reference_file),
      topic_name = $7, start_at = $8, due_at = $9, updated_at = CURRENT_TIMESTAMP
      WHERE assignment_id = $10
    `, [title, desc, inst, maxMarks, status, refFile, topicName, startAt, dueAt, aid]);
    
    res.json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed: ' + err.message });
  }
});

router.delete('/', async (req, res) => {
  const aid = req.query.assignment_id || req.query.id;
  if (!aid) return res.status(400).json({ error: 'ID required' });
  
  try {
    await query('DELETE FROM assignments WHERE assignment_id = $1', [aid]);
    res.json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
