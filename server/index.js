import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import teacherCoursesRoutes from './routes/teacherCourses.js';
import teacherQuizzesRoutes from './routes/teacherQuizzes.js';
import teacherTopicsRoutes from './routes/teacherTopics.js';
import teacherAnalyticsRoutes from './routes/teacherAnalytics.js';
import teacherAssignmentsRoutes from './routes/teacherAssignments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Teacher Routes
app.use('/api/teacher_courses', teacherCoursesRoutes);
app.use('/api/courses', teacherCoursesRoutes);
app.use('/api/quizzes', teacherQuizzesRoutes);
app.use('/api/question_bank', teacherQuizzesRoutes);
app.use('/api/quiz_results', teacherQuizzesRoutes);
app.use('/api/topics', teacherTopicsRoutes);
app.use('/api/teacher_analytics', teacherAnalyticsRoutes);
app.use('/api/teacher_students', teacherAnalyticsRoutes);
app.use('/api/interventions', teacherAnalyticsRoutes);
app.use('/api/teacher_reports', teacherAnalyticsRoutes);
app.use('/api/assignments', teacherAssignmentsRoutes);
app.use('/api/upload', express.json({limit: '50mb'}));
app.post('/api/upload', (req, res) => {
  // Mock upload endpoint that returns a dummy URL or base64
  res.json({ url: req.body.fileData || 'uploaded_file.pdf' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Node.js backend running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
