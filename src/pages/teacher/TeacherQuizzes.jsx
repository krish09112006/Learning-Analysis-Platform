import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Sparkles,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  X,
  RefreshCw,
  BookOpen,
  Clock,
  Award,
  Search,
  Copy,
  BarChart3,
  Layers,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Play,
  Save,
  Send,
  Database,
  CheckSquare,
  FileText,
  Calendar,
  Sliders,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import quizService from '../../services/quizService';
import courseService from '../../services/courseService';

const QUESTION_TYPES = [
  { id: 'mcq', label: 'Multiple Choice (Single Correct)' },
  { id: 'multiple_select', label: 'Multiple Select (Multiple Correct)' },
  { id: 'true_false', label: 'True / False' },
  { id: 'fill_blank', label: 'Fill in the Blank' },
  { id: 'short_answer', label: 'Short Answer' }
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const createEmptyQuestion = (order = 1, topicId = '', topicName = 'General') => ({
  id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  question_text: '',
  question_type: 'mcq',
  topic_id: topicId || '',
  topic_name: topicName || 'General',
  difficulty: 'Beginner',
  marks: 2,
  negative_marks: 0,
  structured_options: [
    { text: '', is_correct: true, display_order: 1 },
    { text: '', is_correct: false, display_order: 2 },
    { text: '', is_correct: false, display_order: 3 },
    { text: '', is_correct: false, display_order: 4 }
  ],
  correct_answer: 'A',
  explanation: '',
  image_url: '',
  display_order: order
});

export default function TeacherQuizzes({ initialTab = 'dashboard' }) {
  // Primary workspace navigation: 'dashboard' | 'editor' | 'smart_builder' | 'question_bank' | 'review' | 'student_preview'
  const [activeView, setActiveView] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveView(initialTab);
    }
  }, [initialTab]);

  // Courses & Topics state
  const [courses, setCourses] = useState([]);
  const [topicsByCourse, setTopicsByCourse] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusBanner, setStatusBanner] = useState(null);

  // Dashboard Filters, Sorting, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Creation Method Selector Modal
  const [showMethodModal, setShowMethodModal] = useState(false);

  // Publish Confirmation Modal
  const [publishConfirmQuiz, setPublishConfirmQuiz] = useState(null);
  const [publishing, setPublishing] = useState(false);

  // Quiz Editor State (shared by Manual Creation & Smart Quiz Builder)
  const [editorStep, setEditorStep] = useState(1); // 1: Quiz Info, 2: 3-Panel Question Editor, 3: Review
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [editorError, setEditorError] = useState('');

  const [quizForm, setQuizForm] = useState({
    quiz_id: null,
    quiz_title: '',
    description: '',
    course_id: '',
    module_name: 'Module 1: Core Foundations',
    topic_id: '',
    topic_name: '',
    instructions: 'Read all questions carefully. Ensure stable connection before starting.',
    difficulty: 'Intermediate',
    quiz_category: 'Topic Assessment',
    total_marks: 10,
    passing_marks: 6,
    duration_minutes: 20,
    max_attempts: 3,
    start_at: '',
    end_at: '',
    randomize_questions: false,
    shuffle_options: false,
    show_answers_after_submission: true,
    allow_retakes: true,
    status: 'Draft',
    creation_method: 'manual',
    learning_objectives: '',
    important_concepts: '',
    questions: [createEmptyQuestion(1)]
  });

  // Smart Quiz Builder State
  const [smartGenerating, setSmartGenerating] = useState(false);
  const [smartError, setSmartError] = useState('');
  const [smartForm, setSmartForm] = useState({
    quiz_title: '',
    course_id: '',
    module_name: 'Module 1: Control Flow & Logic',
    topic_id: '',
    topic_name: '',
    description: '',
    difficulty: 'Intermediate',
    question_count: 10,
    question_type_counts: {
      mcq: 5,
      multiple_select: 2,
      true_false: 2,
      fill_blank: 1,
      short_answer: 0
    },
    total_marks: 20,
    duration_minutes: 20,
    learning_objectives: 'Evaluate conceptual understanding, syntax accuracy, and edge-case analysis.',
    important_concepts: 'For loops, While loops, Nested loops, Break and continue',
    additional_instructions: 'Include practical code-tracing scenarios and clear explanations.'
  });

  // Question-Level Regeneration Confirmation State (Section 7)
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenCandidate, setRegenCandidate] = useState(null); // { questionIndex, oldQuestion, newQuestion, mode }

  // Topic-Based Question Bank State (Section 12)
  const [bankItems, setBankItems] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankCourseFilter, setBankCourseFilter] = useState('');
  const [bankTopicFilter, setBankTopicFilter] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState('All');
  const [bankDiffFilter, setBankDiffFilter] = useState('All');
  const [selectedBankIds, setSelectedBankIds] = useState([]);
  const [editingBankItem, setEditingBankItem] = useState(null);
  const [showBankImportModal, setShowBankImportModal] = useState(false);

  // Student Preview Simulation State (Section 8)
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(1200);

  // Analytics Modal State (Section 16)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Initial Data Load
  const loadAllData = async () => {
    try {
      setLoading(true);
      const cList = await courseService.getAllCourses();
      setCourses(cList || []);

      const tMap = {};
      for (const c of (cList || [])) {
        try {
          const tList = await courseService.getCourseTopics(c.course_id);
          tMap[c.course_id] = tList || [];
        } catch {
          tMap[c.course_id] = [];
        }
      }
      setTopicsByCourse(tMap);

      const firstCourse = cList?.[0]?.course_id || 'py-101';
      const firstTopic = tMap[firstCourse]?.[0];

      setQuizForm(prev => ({
        ...prev,
        course_id: prev.course_id || firstCourse,
        topic_id: prev.topic_id || (firstTopic?.id || ''),
        topic_name: prev.topic_name || (firstTopic?.name || 'Introduction')
      }));

      setSmartForm(prev => ({
        ...prev,
        course_id: prev.course_id || firstCourse,
        topic_id: prev.topic_id || (firstTopic?.id || ''),
        topic_name: prev.topic_name || (firstTopic?.name || 'Loops')
      }));

      const qList = await quizService.getQuizzes();
      setQuizzes(Array.isArray(qList) ? qList : []);
    } catch (err) {
      console.error('Failed to load quiz management data:', err);
      setStatusBanner({ type: 'error', text: 'Unable to connect to quiz backend. Please verify database service.' });
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionBank = async () => {
    try {
      setLoadingBank(true);
      const items = await quizService.getQuestionBank({
        course_id: bankCourseFilter,
        topic_id: bankTopicFilter,
        question_type: bankTypeFilter,
        difficulty: bankDiffFilter,
        search: bankSearch
      });
      setBankItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load question bank:', err);
    } finally {
      setLoadingBank(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeView === 'question_bank' || showBankImportModal) {
      loadQuestionBank();
    }
  }, [activeView, showBankImportModal, bankCourseFilter, bankTopicFilter, bankTypeFilter, bankDiffFilter, bankSearch]);

  // Timer simulation for Student Preview
  useEffect(() => {
    if (activeView !== 'student_preview' || previewSubmitted) return;
    const interval = setInterval(() => {
      setPreviewTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeView, previewSubmitted]);

  // Live computed total marks from questions
  const calculatedQuestionMarksSum = useMemo(() => {
    return (quizForm.questions || []).reduce((acc, q) => acc + (parseFloat(q.marks) || 0), 0);
  }, [quizForm.questions]);

  // Sync quizForm.total_marks when questions change
  useEffect(() => {
    if (calculatedQuestionMarksSum > 0) {
      setQuizForm(prev => ({
        ...prev,
        total_marks: Number(calculatedQuestionMarksSum.toFixed(2)),
        passing_marks: Math.min(prev.passing_marks, Number(calculatedQuestionMarksSum.toFixed(2)))
      }));
    }
  }, [calculatedQuestionMarksSum]);

  // Dashboard Summary Statistics (Section 2)
  const dashboardStats = useMemo(() => {
    const total = quizzes.length;
    const published = quizzes.filter(q => q.status === 'Published').length;
    const draft = quizzes.filter(q => q.status === 'Draft').length;
    const scheduled = quizzes.filter(q => q.status === 'Scheduled').length;
    const closed = quizzes.filter(q => q.status === 'Closed' || q.status === 'Archived').length;
    const totalAttempts = quizzes.reduce((acc, q) => acc + (parseInt(q.attempts_count, 10) || 0), 0);
    const quizzesWithAttempts = quizzes.filter(q => (parseInt(q.attempts_count, 10) || 0) > 0);
    const avgScore = quizzesWithAttempts.length > 0
      ? (quizzesWithAttempts.reduce((acc, q) => acc + (parseFloat(q.avg_score) || 0), 0) / quizzesWithAttempts.length).toFixed(1)
      : '0.0';
    return { total, published, draft, scheduled, closed, totalAttempts, avgScore };
  }, [quizzes]);

  // Filtered & Sorted Quizzes for Dashboard Table
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter(q => {
        if (filterCourse !== 'All' && String(q.frontend_course_id) !== String(filterCourse) && String(q.course_id) !== String(filterCourse)) {
          return false;
        }
        if (filterModule !== 'All' && (q.module_name || 'Module 1') !== filterModule) return false;
        if (filterTopic !== 'All' && String(q.topic_id) !== String(filterTopic) && q.topic_name !== filterTopic) return false;
        if (filterDifficulty !== 'All' && q.difficulty !== filterDifficulty) return false;
        if (filterStatus !== 'All' && q.status !== filterStatus) return false;
        if (filterDate && q.created_at && !q.created_at.startsWith(filterDate)) return false;
        if (searchQuery.trim() !== '') {
          const s = searchQuery.toLowerCase();
          const matchTitle = (q.title || '').toLowerCase().includes(s);
          const matchTopic = (q.topic_name || '').toLowerCase().includes(s);
          const matchCourse = (q.course_name || '').toLowerCase().includes(s);
          const matchMod = (q.module_name || '').toLowerCase().includes(s);
          return matchTitle || matchTopic || matchCourse || matchMod;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'marks') return (parseFloat(b.total_marks) || 0) - (parseFloat(a.total_marks) || 0);
        if (sortBy === 'attempts') return (parseInt(b.attempts_count, 10) || 0) - (parseInt(a.attempts_count, 10) || 0);
        return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0);
      });
  }, [quizzes, filterCourse, filterModule, filterTopic, filterDifficulty, filterStatus, filterDate, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / pageSize));
  const paginatedQuizzes = filteredQuizzes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Course helper to get topics for selected course
  const getTopicsForCourse = (courseId) => {
    if (!courseId) return [];
    if (topicsByCourse[courseId]) return topicsByCourse[courseId];
    const intMap = { '1': 'py-101', '2': 'db-101', '3': 'wd-101' };
    const mapped = intMap[String(courseId)];
    return mapped ? (topicsByCourse[mapped] || []) : [];
  };

  // Start New Manual Quiz
  const handleStartManualQuiz = () => {
    setShowMethodModal(false);
    const firstCourse = courses[0]?.course_id || 'py-101';
    const cTopics = getTopicsForCourse(firstCourse);
    const firstTopic = cTopics[0];

    setQuizForm({
      quiz_id: null,
      quiz_title: '',
      description: '',
      course_id: firstCourse,
      module_name: 'Module 1: Core Foundations',
      topic_id: firstTopic?.id || '',
      topic_name: firstTopic?.name || 'Introduction',
      instructions: 'Answer all questions carefully before submitting. Check negative marking rules if enabled.',
      difficulty: 'Intermediate',
      quiz_category: 'Topic Assessment',
      total_marks: 2,
      passing_marks: 1,
      duration_minutes: 20,
      max_attempts: 3,
      start_at: '',
      end_at: '',
      randomize_questions: false,
      shuffle_options: false,
      show_answers_after_submission: true,
      allow_retakes: true,
      status: 'Draft',
      creation_method: 'manual',
      learning_objectives: '',
      important_concepts: '',
      questions: [createEmptyQuestion(1, firstTopic?.id || '', firstTopic?.name || 'Introduction')]
    });
    setActiveQuestionIdx(0);
    setEditorStep(1);
    setEditorError('');
    setActiveView('editor');
  };

  // Start Smart Quiz Builder
  const handleStartSmartBuilder = () => {
    setShowMethodModal(false);
    setSmartError('');
    setActiveView('smart_builder');
  };

  // Edit or Review Existing Quiz from Database
  const handleOpenExistingQuiz = async (quizRow, targetView = 'editor') => {
    try {
      setLoading(true);
      const fullQuiz = await quizService.getQuizById(quizRow.id);
      const cId = fullQuiz.frontend_course_id || fullQuiz.course_id;
      const loadedQuestions = (fullQuiz.questions && fullQuiz.questions.length > 0)
        ? fullQuiz.questions.map((q, idx) => ({
            ...q,
            question_text: q.question_text || q.question || '',
            question_type: q.question_type || 'mcq',
            structured_options: (q.structured_options && q.structured_options.length > 0)
              ? q.structured_options
              : (q.options || []).map((txt, oIdx) => ({
                  text: txt,
                  is_correct: String(q.correct_answer || 'A').toUpperCase().split(',').includes(['A', 'B', 'C', 'D'][oIdx]),
                  display_order: oIdx + 1
                })),
            marks: parseFloat(q.marks) || 1,
            negative_marks: parseFloat(q.negative_marks) || 0,
            display_order: q.display_order || (idx + 1)
          }))
        : [createEmptyQuestion(1, fullQuiz.topic_id, fullQuiz.topic_name)];

      setQuizForm({
        quiz_id: fullQuiz.id,
        quiz_title: fullQuiz.title || fullQuiz.quiz_title || '',
        description: fullQuiz.description || '',
        course_id: cId,
        module_name: fullQuiz.module_name || 'Module 1',
        topic_id: fullQuiz.topic_id || '',
        topic_name: fullQuiz.topic_name || 'General',
        instructions: fullQuiz.instructions || 'Complete all questions within the time limit.',
        difficulty: fullQuiz.difficulty || 'Intermediate',
        quiz_category: fullQuiz.quiz_category || 'Topic Assessment',
        total_marks: parseFloat(fullQuiz.total_marks) || loadedQuestions.reduce((s, q) => s + q.marks, 0),
        passing_marks: parseFloat(fullQuiz.passing_marks) || 3,
        duration_minutes: parseInt(fullQuiz.duration_minutes || fullQuiz.time_limit, 10) || 20,
        max_attempts: parseInt(fullQuiz.max_attempts, 10) || 3,
        start_at: fullQuiz.start_at ? fullQuiz.start_at.slice(0, 16) : '',
        end_at: fullQuiz.end_at ? fullQuiz.end_at.slice(0, 16) : '',
        randomize_questions: Boolean(Number(fullQuiz.randomize_questions)),
        shuffle_options: Boolean(Number(fullQuiz.shuffle_options)),
        show_answers_after_submission: fullQuiz.show_answers_after_submission !== undefined ? Boolean(Number(fullQuiz.show_answers_after_submission)) : true,
        allow_retakes: fullQuiz.allow_retakes !== undefined ? Boolean(Number(fullQuiz.allow_retakes)) : true,
        status: fullQuiz.status || 'Draft',
        creation_method: fullQuiz.creation_method || (Number(fullQuiz.is_generated) ? 'smart' : 'manual'),
        learning_objectives: fullQuiz.learning_objectives || '',
        important_concepts: fullQuiz.important_concepts || '',
        attempts_count: parseInt(fullQuiz.attempts_count, 10) || 0,
        questions: loadedQuestions
      });
      setActiveQuestionIdx(0);
      setEditorStep(targetView === 'review' ? 3 : 2);
      setEditorError('');
      setActiveView(targetView);
    } catch (err) {
      setStatusBanner({ type: 'error', text: 'Failed to load quiz details: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Validate Quiz Form & Questions before saving/publishing
  const validateQuizPayload = () => {
    if (!quizForm.quiz_title || !quizForm.quiz_title.trim()) {
      return 'Quiz Title is required.';
    }
    if (!quizForm.course_id) {
      return 'Please select an authorized Course.';
    }
    if (!quizForm.questions || quizForm.questions.length === 0) {
      return 'A quiz must contain at least one question.';
    }
    if ((parseFloat(quizForm.duration_minutes) || 0) <= 0) {
      return 'Quiz duration must be greater than 0 minutes.';
    }
    if ((parseFloat(quizForm.passing_marks) || 0) > calculatedQuestionMarksSum) {
      return `Passing marks (${quizForm.passing_marks}) cannot exceed total marks (${calculatedQuestionMarksSum}).`;
    }

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      if (!q.question_text || !q.question_text.trim()) {
        return `Question #${i + 1} is missing question text.`;
      }
      if ((parseFloat(q.marks) || 0) <= 0) {
        return `Question #${i + 1} must have marks greater than 0.`;
      }
      if (q.question_type === 'mcq') {
        const opts = (q.structured_options || []).filter(o => o.text && o.text.trim() !== '');
        if (opts.length < 2) {
          return `Question #${i + 1} (Multiple Choice) requires at least 2 non-empty options.`;
        }
        const correctCount = (q.structured_options || []).filter(o => o.is_correct).length;
        if (correctCount !== 1) {
          return `Question #${i + 1} (Single-Choice MCQ) must have exactly 1 correct option selected.`;
        }
      } else if (q.question_type === 'multiple_select') {
        const opts = (q.structured_options || []).filter(o => o.text && o.text.trim() !== '');
        if (opts.length < 2) {
          return `Question #${i + 1} (Multiple Select) requires at least 2 non-empty options.`;
        }
        const correctCount = (q.structured_options || []).filter(o => o.is_correct).length;
        if (correctCount < 1) {
          return `Question #${i + 1} (Multiple Select) requires at least 1 correct option checked.`;
        }
      } else if (q.question_type === 'fill_blank' || q.question_type === 'short_answer') {
        if (!q.correct_answer || !String(q.correct_answer).trim()) {
          return `Question #${i + 1} (${q.question_type === 'fill_blank' ? 'Fill in the Blank' : 'Short Answer'}) requires an expected answer.`;
        }
      }
    }
    return null;
  };

  // Save Quiz as Draft (or update existing)
  const handleSaveQuizDraft = async (andOpenReview = false) => {
    setEditorError('');
    const validationErr = validateQuizPayload();
    if (validationErr) {
      setEditorError(validationErr);
      return;
    }

    try {
      setSavingQuiz(true);
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const normalizedQuestions = quizForm.questions.map((q, idx) => {
        let correctAns = q.correct_answer;
        if (q.question_type === 'mcq' || q.question_type === 'multiple_select') {
          const corrLetters = [];
          (q.structured_options || []).forEach((o, oIdx) => {
            if (o.is_correct) corrLetters.push(letters[oIdx] || String(oIdx + 1));
          });
          correctAns = q.question_type === 'multiple_select' ? corrLetters.join(',') : (corrLetters[0] || 'A');
        }
        return {
          ...q,
          display_order: idx + 1,
          correct_answer: correctAns,
          options: (q.structured_options || []).map(o => o.text)
        };
      });

      const payload = {
        ...quizForm,
        time_limit: parseInt(quizForm.duration_minutes, 10) || 20,
        total_marks: calculatedQuestionMarksSum,
        status: quizForm.quiz_id ? quizForm.status : 'Draft',
        questions: normalizedQuestions
      };

      let savedId = quizForm.quiz_id;
      if (savedId) {
        await quizService.updateQuiz(payload);
      } else {
        const res = await quizService.createQuiz({ ...payload, status: 'Draft' });
        savedId = res.quiz_id || res.id;
        setQuizForm(prev => ({ ...prev, quiz_id: savedId, status: 'Draft' }));
      }

      await loadAllData();
      setStatusBanner({ type: 'success', text: `Quiz "${quizForm.quiz_title}" saved as Draft in database.` });

      if (andOpenReview) {
        setActiveView('review');
      }
    } catch (err) {
      setEditorError('Your quiz could not be saved. Your current edits are still available. (' + err.message + ')');
    } finally {
      setSavingQuiz(false);
    }
  };

  // Explicit Publish Confirmation Handler (Section 9)
  const handleConfirmPublish = async () => {
    if (!publishConfirmQuiz) return;
    try {
      setPublishing(true);
      // If currently editing this quiz, save latest changes first
      let targetId = publishConfirmQuiz.quiz_id || publishConfirmQuiz.id;
      if (activeView === 'editor' || activeView === 'review') {
        const err = validateQuizPayload();
        if (err) {
          setEditorError(err);
          setPublishConfirmQuiz(null);
          setPublishing(false);
          return;
        }
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const normalizedQuestions = quizForm.questions.map((q, idx) => {
          let correctAns = q.correct_answer;
          if (q.question_type === 'mcq' || q.question_type === 'multiple_select') {
            const corrLetters = [];
            (q.structured_options || []).forEach((o, oIdx) => {
              if (o.is_correct) corrLetters.push(letters[oIdx] || String(oIdx + 1));
            });
            correctAns = q.question_type === 'multiple_select' ? corrLetters.join(',') : (corrLetters[0] || 'A');
          }
          return { ...q, display_order: idx + 1, correct_answer: correctAns };
        });

        if (targetId) {
          await quizService.updateQuiz({
            ...quizForm,
            quiz_id: targetId,
            time_limit: parseInt(quizForm.duration_minutes, 10) || 20,
            total_marks: calculatedQuestionMarksSum,
            questions: normalizedQuestions
          });
        } else {
          const created = await quizService.createQuiz({
            ...quizForm,
            time_limit: parseInt(quizForm.duration_minutes, 10) || 20,
            total_marks: calculatedQuestionMarksSum,
            status: 'Draft',
            questions: normalizedQuestions
          });
          targetId = created.quiz_id || created.id;
        }
      }

      const pubRes = await quizService.publishQuiz(targetId);
      setPublishConfirmQuiz(null);
      await loadAllData();
      setQuizForm(prev => ({ ...prev, quiz_id: targetId, status: pubRes.status || 'Published' }));
      setStatusBanner({
        type: 'success',
        text: pubRes.message || 'Quiz published and now accessible to enrolled students!'
      });
      setActiveView('dashboard');
    } catch (err) {
      setStatusBanner({ type: 'error', text: 'Publishing failed: ' + err.message });
      setPublishConfirmQuiz(null);
    } finally {
      setPublishing(false);
    }
  };

  // Duplicate Quiz Handler (Section 13)
  const handleDuplicateQuiz = async (quiz) => {
    try {
      await quizService.duplicateQuiz(quiz.id);
      await loadAllData();
      setStatusBanner({
        type: 'success',
        text: `Duplicated "${quiz.title}" as a new Draft quiz (without student attempts).`
      });
    } catch (err) {
      setStatusBanner({ type: 'error', text: 'Duplication failed: ' + err.message });
    }
  };

  // Delete Quiz Handler
  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) return;
    try {
      await quizService.deleteQuiz(quiz.id);
      await loadAllData();
      setStatusBanner({ type: 'success', text: `Deleted quiz "${quiz.title}".` });
    } catch (err) {
      setStatusBanner({ type: 'error', text: 'Failed to delete quiz: ' + err.message });
    }
  };

  // Smart Quiz Builder Generation Handler (Section 5 & 6)
  const smartTypeSum = useMemo(() => {
    return Object.values(smartForm.question_type_counts).reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
  }, [smartForm.question_type_counts]);

  const handleGenerateSmartDraft = async (e) => {
    e.preventDefault();
    setSmartError('');

    if (!smartForm.quiz_title.trim()) {
      setSmartError('Quiz Title is required.');
      return;
    }
    if (!smartForm.course_id) {
      setSmartError('Please select a Course.');
      return;
    }
    if (smartTypeSum !== parseInt(smartForm.question_count, 10)) {
      setSmartError(`The sum of selected question types (${smartTypeSum}) must equal the requested Number of Questions (${smartForm.question_count}).`);
      return;
    }

    try {
      setSmartGenerating(true);
      const draft = await quizService.generateSmartQuizDraft(smartForm);

      const mappedQuestions = (draft.questions || []).map((q, idx) => ({
        id: `smart-${Date.now()}-${idx}`,
        question_text: q.question_text || '',
        question_type: q.question_type || 'mcq',
        topic_id: q.topic_id || smartForm.topic_id || '',
        topic_name: q.topic || smartForm.topic_name || 'General',
        difficulty: q.difficulty || smartForm.difficulty,
        marks: parseFloat(q.marks) || 2,
        negative_marks: 0,
        structured_options: (q.options || []).map((o, oIdx) => ({
          text: o.text || '',
          is_correct: Boolean(o.is_correct),
          display_order: oIdx + 1
        })),
        correct_answer: q.correct_answer || 'A',
        explanation: q.explanation || '',
        image_url: '',
        display_order: idx + 1
      }));

      setQuizForm({
        quiz_id: null,
        quiz_title: draft.quiz_title || smartForm.quiz_title,
        description: draft.description || smartForm.description,
        course_id: smartForm.course_id,
        module_name: smartForm.module_name || 'Module 1',
        topic_id: smartForm.topic_id || '',
        topic_name: draft.topic_name || smartForm.topic_name || 'General',
        instructions: smartForm.additional_instructions || 'Review each question carefully before submitting.',
        difficulty: smartForm.difficulty === 'Mixed' ? 'Intermediate' : smartForm.difficulty,
        quiz_category: 'Smart Generated Assessment',
        total_marks: parseFloat(draft.total_marks) || mappedQuestions.reduce((s, q) => s + q.marks, 0),
        passing_marks: Math.ceil((parseFloat(draft.total_marks) || 20) * 0.6),
        duration_minutes: parseInt(smartForm.duration_minutes, 10) || 20,
        max_attempts: 3,
        start_at: '',
        end_at: '',
        randomize_questions: false,
        shuffle_options: false,
        show_answers_after_submission: true,
        allow_retakes: true,
        status: 'Draft',
        creation_method: 'smart',
        learning_objectives: smartForm.learning_objectives,
        important_concepts: smartForm.important_concepts,
        questions: mappedQuestions
      });

      setActiveQuestionIdx(0);
      setEditorStep(2);
      setStatusBanner({
        type: 'warning',
        text: 'Smart Quiz Draft generated! Teacher review is mandatory — inspect, edit, or regenerate questions before saving or publishing.'
      });
      setActiveView('editor');
    } catch (err) {
      setSmartError(err.message || 'Unable to generate quiz questions. Please try again.');
    } finally {
      setSmartGenerating(false);
    }
  };

  // Question-Level Regeneration Handler (Section 7)
  const handleTriggerQuestionRegen = async (qIndex, mode = 'full', overrideDiff = null) => {
    const targetQ = quizForm.questions[qIndex];
    if (!targetQ) return;

    try {
      setRegenLoading(true);
      const courseObj = courses.find(c => String(c.course_id) === String(quizForm.course_id));
      const res = await quizService.regenerateQuizQuestion({
        course_name: courseObj?.course_name || 'Python Programming',
        module_name: quizForm.module_name,
        topic_name: targetQ.topic_name || quizForm.topic_name || 'Core Topic',
        question_type: targetQ.question_type,
        difficulty: overrideDiff || targetQ.difficulty || quizForm.difficulty,
        marks: targetQ.marks,
        display_order: qIndex + 1,
        important_concepts: quizForm.important_concepts,
        regen_mode: mode,
        current_question: targetQ
      });

      const cand = res.candidate_question;
      if (cand) {
        const formattedCandidate = {
          ...targetQ,
          question_text: cand.question_text || targetQ.question_text,
          question_type: cand.question_type || targetQ.question_type,
          difficulty: cand.difficulty || overrideDiff || targetQ.difficulty,
          structured_options: (cand.options && cand.options.length > 0)
            ? cand.options.map((o, idx) => ({
                text: o.text || '',
                is_correct: Boolean(o.is_correct),
                display_order: idx + 1
              }))
            : targetQ.structured_options,
          correct_answer: cand.correct_answer || targetQ.correct_answer,
          explanation: cand.explanation || targetQ.explanation
        };

        setRegenCandidate({
          questionIndex: qIndex,
          oldQuestion: targetQ,
          newQuestion: formattedCandidate,
          mode
        });
      }
    } catch (err) {
      setEditorError('Regeneration failed — existing question preserved unchanged. (' + err.message + ')');
    } finally {
      setRegenLoading(false);
    }
  };

  const handleConfirmReplaceQuestion = () => {
    if (!regenCandidate) return;
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated[regenCandidate.questionIndex] = regenCandidate.newQuestion;
      return { ...prev, questions: updated };
    });
    setRegenCandidate(null);
    setStatusBanner({ type: 'success', text: `Question #${regenCandidate.questionIndex + 1} replaced with newly generated version.` });
  };

  // Question Editor Manipulation Helpers
  const activeQuestion = quizForm.questions[activeQuestionIdx] || quizForm.questions[0];

  const updateActiveQuestion = (patch) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      const curr = { ...updated[activeQuestionIdx], ...patch };

      // If switching question_type, ensure appropriate options structure
      if (patch.question_type && patch.question_type !== updated[activeQuestionIdx].question_type) {
        if (patch.question_type === 'true_false') {
          curr.structured_options = [
            { text: 'True', is_correct: true, display_order: 1 },
            { text: 'False', is_correct: false, display_order: 2 }
          ];
          curr.correct_answer = 'True';
        } else if (patch.question_type === 'mcq' || patch.question_type === 'multiple_select') {
          if (!curr.structured_options || curr.structured_options.length < 2) {
            curr.structured_options = [
              { text: 'Option A', is_correct: true, display_order: 1 },
              { text: 'Option B', is_correct: false, display_order: 2 },
              { text: 'Option C', is_correct: false, display_order: 3 },
              { text: 'Option D', is_correct: false, display_order: 4 }
            ];
          }
          curr.correct_answer = 'A';
        } else {
          curr.structured_options = [];
          curr.correct_answer = '';
        }
      }

      updated[activeQuestionIdx] = curr;
      return { ...prev, questions: updated };
    });
  };

  const handleAddQuestion = () => {
    const nextOrder = quizForm.questions.length + 1;
    const newQ = createEmptyQuestion(nextOrder, quizForm.topic_id, quizForm.topic_name);
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));
    setActiveQuestionIdx(quizForm.questions.length);
  };

  const handleDuplicateQuestion = (idx) => {
    const src = quizForm.questions[idx];
    const clone = {
      ...JSON.parse(JSON.stringify(src)),
      id: `dup-${Date.now()}`,
      question_text: `${src.question_text} (Copy)`,
      display_order: quizForm.questions.length + 1
    };
    setQuizForm(prev => {
      const next = [...prev.questions];
      next.splice(idx + 1, 0, clone);
      return { ...prev, questions: next.map((q, i) => ({ ...q, display_order: i + 1 })) };
    });
    setActiveQuestionIdx(idx + 1);
  };

  const handleDeleteQuestionFromEditor = (idx) => {
    if (quizForm.questions.length <= 1) {
      setEditorError('A quiz must have at least 1 question.');
      return;
    }
    setQuizForm(prev => {
      const next = prev.questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, display_order: i + 1 }));
      return { ...prev, questions: next };
    });
    setActiveQuestionIdx(Math.max(0, idx - 1));
  };

  const handleMoveQuestion = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= quizForm.questions.length) return;
    setQuizForm(prev => {
      const next = [...prev.questions];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return { ...prev, questions: next.map((q, i) => ({ ...q, display_order: i + 1 })) };
    });
    setActiveQuestionIdx(targetIdx);
  };

  // Save current question from Quiz Editor to Topic-Based Question Bank
  const handleSaveQuestionToBank = async (q) => {
    if (!q.question_text || !q.question_text.trim()) {
      setEditorError('Enter question text before saving to Question Bank.');
      return;
    }
    try {
      await quizService.saveToQuestionBank({
        course_id: quizForm.course_id || 1,
        topic_id: q.topic_id || quizForm.topic_id || null,
        topic_name: q.topic_name || quizForm.topic_name || 'General',
        question_text: q.question_text,
        question_type: q.question_type,
        difficulty: q.difficulty,
        marks: q.marks,
        negative_marks: q.negative_marks || 0,
        options: q.structured_options || [],
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        image_url: q.image_url || ''
      });
      setStatusBanner({
        type: 'success',
        text: `Saved question under topic "${q.topic_name || quizForm.topic_name || 'General'}" in Question Bank!`
      });
    } catch (err) {
      setStatusBanner({ type: 'error', text: 'Failed to save to Question Bank: ' + err.message });
    }
  };

  // Import selected Question Bank items as independent copies into the active Quiz Editor
  const handleCopySelectedBankToEditor = () => {
    const chosen = bankItems.filter(b => selectedBankIds.includes(b.id));
    if (chosen.length === 0) return;

    const copiedQuestions = chosen.map((b, idx) => ({
      id: `bank-copy-${b.id}-${Date.now()}-${idx}`,
      question_text: b.question_text,
      question_type: b.question_type || 'mcq',
      topic_id: b.topic_id || quizForm.topic_id || '',
      topic_name: b.topic_name || quizForm.topic_name || 'General',
      difficulty: b.difficulty || 'Beginner',
      marks: parseFloat(b.marks) || 2,
      negative_marks: parseFloat(b.negative_marks) || 0,
      structured_options: (b.options && b.options.length > 0)
        ? b.options.map((o, oIdx) => ({
            text: o.text || '',
            is_correct: Boolean(o.is_correct),
            display_order: oIdx + 1
          }))
        : [
            { text: 'Option A', is_correct: true, display_order: 1 },
            { text: 'Option B', is_correct: false, display_order: 2 }
          ],
      correct_answer: b.correct_answer || 'A',
      explanation: b.explanation || '',
      image_url: b.image_url || '',
      display_order: quizForm.questions.length + idx + 1
    }));

    setQuizForm(prev => {
      // Remove empty initial placeholder if it has no question text
      const existingNonEmpty = prev.questions.filter(q => q.question_text && q.question_text.trim() !== '');
      const merged = [...existingNonEmpty, ...copiedQuestions].map((q, i) => ({ ...q, display_order: i + 1 }));
      return { ...prev, questions: merged };
    });

    setSelectedBankIds([]);
    setShowBankImportModal(false);
    if (activeView === 'question_bank') {
      setEditorStep(2);
      setActiveView('editor');
    }
    setStatusBanner({
      type: 'success',
      text: `Copied ${copiedQuestions.length} question(s) from Question Bank into quiz editor.`
    });
  };

  // Open Analytics Modal
  const handleOpenAnalytics = async (quiz) => {
    try {
      setLoadingAnalytics(true);
      setShowAnalyticsModal(true);
      const data = await quizService.getQuizAnalytics(quiz.id);
      setAnalyticsData(data);
    } catch (err) {
      setStatusBanner({ type: 'error', text: 'Unable to load quiz analytics: ' + err.message });
      setShowAnalyticsModal(false);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Top Status Notification Banner */}
      {statusBanner && (
        <div style={{
          ...styles.banner,
          backgroundColor: statusBanner.type === 'error' ? 'rgba(239,68,68,0.12)' : statusBanner.type === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
          borderColor: statusBanner.type === 'error' ? 'var(--danger)' : statusBanner.type === 'warning' ? 'var(--warning)' : 'var(--success)',
          color: statusBanner.type === 'error' ? 'var(--danger)' : statusBanner.type === 'warning' ? 'var(--warning)' : 'var(--success)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{statusBanner.text}</span>
          </div>
          <button onClick={() => setStatusBanner(null)} style={styles.bannerClose}><X size={16} /></button>
        </div>
      )}

      {/* Top Header & Primary Mode Bar */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageTitle}>Teacher Quiz Management Module</h2>
          <p style={styles.pageSubtitle}>
            Author manual evaluations, synthesize structured drafts with Smart Quiz Builder, and curate your Topic-Based Question Bank.
          </p>
        </div>

        <div style={styles.topActions}>
          <div style={styles.modeTabs}>
            <button
              onClick={() => setActiveView('dashboard')}
              style={{ ...styles.modeTab, ...(activeView === 'dashboard' ? styles.modeTabActive : {}) }}
            >
              <BarChart3 size={15} /> Quiz Dashboard
            </button>
            <button
              onClick={() => setActiveView('smart_builder')}
              style={{ ...styles.modeTab, ...(activeView === 'smart_builder' ? styles.modeTabActive : {}) }}
            >
              <Sparkles size={15} /> Smart Quiz Builder
            </button>
            <button
              onClick={() => setActiveView('question_bank')}
              style={{ ...styles.modeTab, ...(activeView === 'question_bank' ? styles.modeTabActive : {}) }}
            >
              <Database size={15} /> Topic Question Bank
            </button>
          </div>

          <button onClick={() => setShowMethodModal(true)} style={styles.primaryBtn}>
            <Plus size={16} /> Create Quiz
          </button>
          <button onClick={handleStartSmartBuilder} style={styles.smartBtn}>
            <Sparkles size={16} /> Smart Quiz Builder
          </button>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: QUIZ MANAGEMENT DASHBOARD (Section 2)
      ===================================================================== */}
      {activeView === 'dashboard' && (
        <>
          {/* 7 KPI Overview Cards */}
          <div style={styles.kpiGrid}>
            <div className="glass-card" style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Total Quizzes</span>
              <strong style={styles.kpiValue}>{dashboardStats.total}</strong>
            </div>
            <div className="glass-card" style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Published Quizzes</span>
              <strong style={{ ...styles.kpiValue, color: 'var(--success)' }}>{dashboardStats.published}</strong>
            </div>
            <div className="glass-card" style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Draft Quizzes</span>
              <strong style={{ ...styles.kpiValue, color: 'var(--warning)' }}>{dashboardStats.draft}</strong>
            </div>
            <div className="glass-card" style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Scheduled Quizzes</span>
              <strong style={{ ...styles.kpiValue, color: 'var(--primary)' }}>{dashboardStats.scheduled}</strong>
            </div>
            <div className="glass-card" style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Closed Quizzes</span>
              <strong style={{ ...styles.kpiValue, color: 'var(--text-muted)' }}>{dashboardStats.closed}</strong>
            </div>
            <div className="glass-card" style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Total Student Attempts</span>
              <strong style={{ ...styles.kpiValue, color: 'var(--primary)' }}>{dashboardStats.totalAttempts}</strong>
            </div>
            <div className="glass-card" style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Average Quiz Score</span>
              <strong style={{ ...styles.kpiValue, color: 'var(--success)' }}>{dashboardStats.avgScore}%</strong>
            </div>
          </div>

          {/* Search & Multi-Filter Toolbar */}
          <div className="glass-card" style={styles.filterToolbar}>
            <div style={styles.searchBox}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by quiz title, course, module, or topic..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filtersWrap}>
              <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setCurrentPage(1); }} style={styles.filterSelect}>
                <option value="All">All Courses</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                ))}
              </select>

              <select value={filterDifficulty} onChange={e => { setFilterDifficulty(e.target.value); setCurrentPage(1); }} style={styles.filterSelect}>
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={styles.filterSelect}>
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Closed">Closed</option>
              </select>

              <input
                type="date"
                value={filterDate}
                onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
                style={styles.filterSelect}
                title="Filter by Creation Date"
              />

              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.filterSelect}>
                <option value="newest">Sort: Newest First</option>
                <option value="title">Sort: Quiz Name (A-Z)</option>
                <option value="marks">Sort: Highest Marks</option>
                <option value="attempts">Sort: Most Attempts</option>
              </select>
            </div>
          </div>

          {/* Quiz Management Table */}
          <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin" />
                <p style={{ marginTop: '8px' }}>Loading quizzes from database...</p>
              </div>
            ) : paginatedQuizzes.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <HelpCircle size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p>No quizzes match your current filters.</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Quiz Name</th>
                    <th style={styles.th}>Course</th>
                    <th style={styles.th}>Module</th>
                    <th style={styles.th}>Topic</th>
                    <th style={styles.th}>Questions</th>
                    <th style={styles.th}>Total Marks</th>
                    <th style={styles.th}>Duration</th>
                    <th style={styles.th}>Attempts</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuizzes.map(q => (
                    <tr key={q.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{q.title}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <span style={{
                            ...styles.miniBadge,
                            backgroundColor: q.creation_method === 'smart' ? 'rgba(139,92,246,0.15)' : 'rgba(2,132,199,0.12)',
                            color: q.creation_method === 'smart' ? '#a78bfa' : 'var(--primary)'
                          }}>
                            {q.creation_method === 'smart' ? '✨ Smart Builder' : '✍️ Manual'}
                          </span>
                          <span style={styles.miniBadge}>{q.difficulty}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{q.course_name}</td>
                      <td style={styles.td}>{q.module_name || 'Module 1'}</td>
                      <td style={styles.td}>{q.topic_name || 'Course-Wide'}</td>
                      <td style={styles.td}><strong>{q.question_count || 0}</strong></td>
                      <td style={styles.td}><strong>{q.total_marks}</strong> pts</td>
                      <td style={styles.td}>{q.duration_minutes || q.time_limit} mins</td>
                      <td style={styles.td}>
                        <strong>{q.attempts_count || 0}</strong>
                        {Number(q.attempts_count) > 0 && (
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--success)' }}>
                            Avg: {q.avg_score}%
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusPill,
                          backgroundColor:
                            q.status === 'Published' ? 'rgba(16,185,129,0.15)' :
                            q.status === 'Scheduled' ? 'rgba(2,132,199,0.15)' :
                            q.status === 'Closed' ? 'rgba(148,163,184,0.15)' : 'rgba(245,158,11,0.15)',
                          color:
                            q.status === 'Published' ? 'var(--success)' :
                            q.status === 'Scheduled' ? 'var(--primary)' :
                            q.status === 'Closed' ? 'var(--text-muted)' : 'var(--warning)'
                        }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleOpenExistingQuiz(q, 'review')}
                            style={styles.iconBtn}
                            title="View & Review Quiz"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenExistingQuiz(q, 'editor')}
                            style={styles.iconBtn}
                            title="Edit Quiz & Questions"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenAnalytics(q)}
                            style={styles.iconBtn}
                            title="Quiz Analytics"
                          >
                            <BarChart3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicateQuiz(q)}
                            style={styles.iconBtn}
                            title="Duplicate Quiz as Draft"
                          >
                            <Copy size={14} />
                          </button>
                          {q.status === 'Draft' && (
                            <button
                              onClick={() => setPublishConfirmQuiz(q)}
                              style={{ ...styles.iconBtn, color: 'var(--success)', borderColor: 'var(--success)' }}
                              title="Publish Quiz"
                            >
                              <Send size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuiz(q)}
                            style={{ ...styles.iconBtn, color: 'var(--danger)' }}
                            title="Delete Quiz"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Footer */}
            {filteredQuizzes.length > pageSize && (
              <div style={styles.paginationBar}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredQuizzes.length)} of {filteredQuizzes.length} quizzes
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={styles.pageBtn}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Page {currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={styles.pageBtn}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================================
          VIEW 2: SMART QUIZ BUILDER (Section 5 & 6)
      ===================================================================== */}
      {activeView === 'smart_builder' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={styles.smartBadge}><Sparkles size={13} /> Smart Quiz Builder</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginTop: '6px', color: 'var(--text-primary)' }}>
                Generate Structured Quiz Draft from Curriculum Specifications
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Specify question distribution, learning objectives, and concepts. Generated questions always open in Draft state for mandatory teacher review.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  const firstCourse = courses[0]?.course_id || 'py-101';
                  const cTopics = getTopicsForCourse(firstCourse);
                  setSmartForm({
                    quiz_title: 'Python Loops & Control Flow Assessment',
                    course_id: firstCourse,
                    module_name: 'Control Flow',
                    topic_id: cTopics[0]?.id || '',
                    topic_name: 'Loops',
                    description: 'Comprehensive assessment of Python loop structures, iteration patterns, and loop control statements.',
                    difficulty: 'Intermediate',
                    question_count: 10,
                    question_type_counts: { mcq: 5, true_false: 2, multiple_select: 2, fill_blank: 1, short_answer: 0 },
                    total_marks: 20,
                    duration_minutes: 20,
                    learning_objectives: 'Implement for/while loops, trace nested loop execution, and apply break/continue statements accurately.',
                    important_concepts: 'For loops, While loops, Nested loops, Break and continue',
                    additional_instructions: 'Include code-tracing questions and clear explanations.'
                  });
                }}
                style={styles.secondaryBtn}
              >
                🐍 Load Example Preset (Python Loops - 10 Qs)
              </button>
              <button type="button" onClick={() => setActiveView('dashboard')} style={styles.secondaryBtn}>
                Back to List
              </button>
            </div>
          </div>

          {smartError && (
            <div style={styles.errorAlert}>
              <AlertTriangle size={16} /> <span>{smartError}</span>
            </div>
          )}

          <form onSubmit={handleGenerateSmartDraft} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={styles.grid3}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Quiz Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Python Loops Mastery Quiz"
                  value={smartForm.quiz_title}
                  onChange={e => setSmartForm({ ...smartForm, quiz_title: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Course *</label>
                <select
                  value={smartForm.course_id}
                  onChange={e => {
                    const cid = e.target.value;
                    const tList = getTopicsForCourse(cid);
                    setSmartForm({
                      ...smartForm,
                      course_id: cid,
                      topic_id: tList[0]?.id || '',
                      topic_name: tList[0]?.name || 'General'
                    });
                  }}
                  style={styles.input}
                >
                  {courses.map(c => (
                    <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Module</label>
                <input
                  type="text"
                  placeholder="e.g., Control Flow"
                  value={smartForm.module_name}
                  onChange={e => setSmartForm({ ...smartForm, module_name: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.grid4}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Associated Topic</label>
                <select
                  value={smartForm.topic_id}
                  onChange={e => {
                    const tid = e.target.value;
                    const tObj = getTopicsForCourse(smartForm.course_id).find(t => String(t.id) === String(tid));
                    setSmartForm({ ...smartForm, topic_id: tid, topic_name: tObj?.name || smartForm.topic_name });
                  }}
                  style={styles.input}
                >
                  <option value="">Course-Wide / Custom Topic</option>
                  {getTopicsForCourse(smartForm.course_id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Difficulty Level *</label>
                <select
                  value={smartForm.difficulty}
                  onChange={e => setSmartForm({ ...smartForm, difficulty: e.target.value })}
                  style={styles.input}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Number of Questions *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={smartForm.question_count}
                  onChange={e => setSmartForm({ ...smartForm, question_count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Total Marks & Duration (mins)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    value={smartForm.total_marks}
                    onChange={e => setSmartForm({ ...smartForm, total_marks: parseFloat(e.target.value) || 10 })}
                    style={styles.input}
                    placeholder="Marks"
                  />
                  <input
                    type="number"
                    min="5"
                    value={smartForm.duration_minutes}
                    onChange={e => setSmartForm({ ...smartForm, duration_minutes: parseInt(e.target.value, 10) || 20 })}
                    style={styles.input}
                    placeholder="Mins"
                  />
                </div>
              </div>
            </div>

            {/* Question Types Count Distribution Box */}
            <div style={styles.typeCountBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Question Type Distribution (Must sum to {smartForm.question_count})
                </strong>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: smartTypeSum === Number(smartForm.question_count) ? 'var(--success)' : 'var(--danger)'
                }}>
                  Selected Total: {smartTypeSum} / {smartForm.question_count} {smartTypeSum === Number(smartForm.question_count) ? '✓ Valid' : '⚠️ Adjust counts'}
                </span>
              </div>
              <div style={styles.grid5}>
                {[
                  { key: 'mcq', label: 'MCQ (Single)' },
                  { key: 'multiple_select', label: 'Multiple Select' },
                  { key: 'true_false', label: 'True / False' },
                  { key: 'fill_blank', label: 'Fill in the Blank' },
                  { key: 'short_answer', label: 'Short Answer' }
                ].map(qt => (
                  <div key={qt.key} style={styles.fieldGroup}>
                    <label style={styles.label}>{qt.label}</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={smartForm.question_type_counts[qt.key]}
                      onChange={e => setSmartForm({
                        ...smartForm,
                        question_type_counts: {
                          ...smartForm.question_type_counts,
                          [qt.key]: Math.max(0, parseInt(e.target.value, 10) || 0)
                        }
                      })}
                      style={styles.input}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Important Concepts (comma or line separated)</label>
                <textarea
                  rows={3}
                  placeholder="For loops, While loops, Nested loops, Break and continue"
                  value={smartForm.important_concepts}
                  onChange={e => setSmartForm({ ...smartForm, important_concepts: e.target.value })}
                  style={styles.textarea}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Learning Objectives & Additional Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Specify Bloom's taxonomy targets or coding emphasis..."
                  value={smartForm.learning_objectives}
                  onChange={e => setSmartForm({ ...smartForm, learning_objectives: e.target.value })}
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="submit"
                disabled={smartGenerating || smartTypeSum !== Number(smartForm.question_count)}
                style={{
                  ...styles.smartBtn,
                  padding: '12px 24px',
                  opacity: (smartGenerating || smartTypeSum !== Number(smartForm.question_count)) ? 0.6 : 1
                }}
              >
                {smartGenerating ? (
                  <><RefreshCw size={16} className="spin" /> Preparing your quiz draft...</>
                ) : (
                  <><Sparkles size={16} /> Generate Quiz Draft</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: COMMON 3-PANEL VISUAL QUIZ EDITOR (Sections 4, 7, 17)
      ===================================================================== */}
      {activeView === 'editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Editor Step Bar */}
          <div className="glass-card" style={styles.stepBar}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setEditorStep(1)}
                style={{ ...styles.stepBtn, ...(editorStep === 1 ? styles.stepBtnActive : {}) }}
              >
                Step 1: Quiz Information & Scheduling
              </button>
              <button
                onClick={() => setEditorStep(2)}
                style={{ ...styles.stepBtn, ...(editorStep === 2 ? styles.stepBtnActive : {}) }}
              >
                Step 2: Visual 3-Panel Question Editor ({quizForm.questions.length})
              </button>
              <button
                onClick={() => setActiveView('review')}
                style={{ ...styles.stepBtn, ...(activeView === 'review' ? styles.stepBtnActive : {}) }}
              >
                Step 3: Review & Publish
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowBankImportModal(true)} style={styles.secondaryBtn}>
                <Database size={14} /> + Import from Question Bank
              </button>
              <button
                onClick={() => {
                  setPreviewAnswers({});
                  setPreviewSubmitted(false);
                  setPreviewTimeRemaining((parseInt(quizForm.duration_minutes, 10) || 20) * 60);
                  setActiveView('student_preview');
                }}
                style={styles.secondaryBtn}
              >
                <Play size={14} /> Preview as Student
              </button>
              <button onClick={() => handleSaveQuizDraft(false)} disabled={savingQuiz} style={styles.primaryBtn}>
                <Save size={14} /> {savingQuiz ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>

          {editorError && (
            <div style={styles.errorAlert}>
              <AlertTriangle size={16} /> <span>{editorError}</span>
            </div>
          )}

          {quizForm.attempts_count > 0 && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245,158,11,0.12)',
              border: '1px solid var(--warning)',
              color: 'var(--warning)',
              fontSize: '0.84rem'
            }}>
              <strong>Safe Editing Policy Active:</strong> This quiz already has {quizForm.attempts_count} student attempt(s). Saving edits will automatically snapshot a prior version in <code>quiz_versions</code> to preserve attempt integrity.
            </div>
          )}

          {/* STEP 1: QUIZ INFORMATION & CONFIGURATION */}
          {editorStep === 1 && (
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Step 1: Quiz Information, Rules & Availability Settings
              </h3>

              <div style={styles.grid3}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Quiz Title *</label>
                  <input
                    type="text"
                    value={quizForm.quiz_title}
                    onChange={e => setQuizForm({ ...quizForm, quiz_title: e.target.value })}
                    placeholder="Enter Quiz Title"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Authorized Course *</label>
                  <select
                    value={quizForm.course_id}
                    onChange={e => {
                      const cid = e.target.value;
                      const cTopics = getTopicsForCourse(cid);
                      setQuizForm({
                        ...quizForm,
                        course_id: cid,
                        topic_id: cTopics[0]?.id || '',
                        topic_name: cTopics[0]?.name || 'General'
                      });
                    }}
                    style={styles.input}
                  >
                    {courses.map(c => (
                      <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Module Name</label>
                  <input
                    type="text"
                    value={quizForm.module_name}
                    onChange={e => setQuizForm({ ...quizForm, module_name: e.target.value })}
                    placeholder="e.g., Module 1: Core Foundations"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.grid4}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Associated Topic</label>
                  <select
                    value={quizForm.topic_id}
                    onChange={e => {
                      const tid = e.target.value;
                      const tObj = getTopicsForCourse(quizForm.course_id).find(t => String(t.id) === String(tid));
                      setQuizForm({ ...quizForm, topic_id: tid, topic_name: tObj?.name || 'Course-Wide' });
                    }}
                    style={styles.input}
                  >
                    <option value="">Course-Wide Assessment</option>
                    {getTopicsForCourse(quizForm.course_id).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Difficulty Level</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={e => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                    style={styles.input}
                  >
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Quiz Category</label>
                  <input
                    type="text"
                    value={quizForm.quiz_category}
                    onChange={e => setQuizForm({ ...quizForm, quiz_category: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Time Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.duration_minutes}
                    onChange={e => setQuizForm({ ...quizForm, duration_minutes: parseInt(e.target.value, 10) || 15 })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.grid4}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Total Marks (Auto-Synced)</label>
                  <input
                    type="number"
                    readOnly
                    value={calculatedQuestionMarksSum}
                    style={{ ...styles.input, opacity: 0.8 }}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Passing Marks *</label>
                  <input
                    type="number"
                    min="0"
                    max={calculatedQuestionMarksSum}
                    value={quizForm.passing_marks}
                    onChange={e => setQuizForm({ ...quizForm, passing_marks: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Maximum Attempts</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quizForm.max_attempts}
                    onChange={e => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value, 10) || 1 })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Creation Method</label>
                  <input
                    type="text"
                    readOnly
                    value={quizForm.creation_method.toUpperCase()}
                    style={{ ...styles.input, opacity: 0.8 }}
                  />
                </div>
              </div>

              <div style={styles.grid2}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Start Date & Time (Optional Scheduling)</label>
                  <input
                    type="datetime-local"
                    value={quizForm.start_at}
                    onChange={e => setQuizForm({ ...quizForm, start_at: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>End Date & Time (Optional Deadline)</label>
                  <input
                    type="datetime-local"
                    value={quizForm.end_at}
                    onChange={e => setQuizForm({ ...quizForm, end_at: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.grid2}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Quiz Description</label>
                  <textarea
                    rows={2}
                    value={quizForm.description}
                    onChange={e => setQuizForm({ ...quizForm, description: e.target.value })}
                    style={styles.textarea}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Student Instructions</label>
                  <textarea
                    rows={2}
                    value={quizForm.instructions}
                    onChange={e => setQuizForm({ ...quizForm, instructions: e.target.value })}
                    style={styles.textarea}
                  />
                </div>
              </div>

              {/* Boolean Toggles */}
              <div style={styles.grid4}>
                {[
                  { key: 'randomize_questions', label: 'Randomize Questions' },
                  { key: 'shuffle_options', label: 'Shuffle Answer Options' },
                  { key: 'show_answers_after_submission', label: 'Show Correct Answers After Submission' },
                  { key: 'allow_retakes', label: 'Allow Retakes' }
                ].map(flag => (
                  <label key={flag.key} style={styles.checkboxCard}>
                    <input
                      type="checkbox"
                      checked={Boolean(quizForm[flag.key])}
                      onChange={e => setQuizForm({ ...quizForm, [flag.key]: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.84rem', fontWeight: '600' }}>{flag.label}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditorStep(2)} style={styles.primaryBtn}>
                  Proceed to Step 2: Question Editor <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 3-PANEL VISUAL QUESTION EDITOR (Section 17 Layout) */}
          {editorStep === 2 && activeQuestion && (
            <div style={styles.threePanelGrid}>
              {/* LEFT PANEL: Question Navigation & List */}
              <div className="glass-card" style={styles.leftPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    Questions ({quizForm.questions.length})
                  </strong>
                  <button onClick={handleAddQuestion} style={styles.smallPrimaryBtn}>
                    + Add Question
                  </button>
                </div>

                <div style={styles.questionNavList}>
                  {quizForm.questions.map((q, idx) => {
                    const isSelected = idx === activeQuestionIdx;
                    return (
                      <div
                        key={q.id || idx}
                        onClick={() => setActiveQuestionIdx(idx)}
                        style={{
                          ...styles.qNavItem,
                          ...(isSelected ? styles.qNavItemActive : {})
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>Q{idx + 1}. ({q.marks}m)</span>
                          <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleMoveQuestion(idx, -1)} disabled={idx === 0} style={styles.tinyArrowBtn} title="Move Up">
                              <ArrowUp size={12} />
                            </button>
                            <button onClick={() => handleMoveQuestion(idx, 1)} disabled={idx === quizForm.questions.length - 1} style={styles.tinyArrowBtn} title="Move Down">
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.question_text || 'Untitled question...'}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <span style={styles.miniBadge}>{q.question_type.toUpperCase()}</span>
                          <span style={styles.miniBadge}>{q.difficulty}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CENTER PANEL: Visual Question & Options Editor */}
              <div className="glass-card" style={styles.centerPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Editing Question #{activeQuestionIdx + 1} of {quizForm.questions.length}
                    </span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {QUESTION_TYPES.find(t => t.id === activeQuestion.question_type)?.label}
                    </h4>
                  </div>

                  {/* Question-Level Actions & Regeneration Controls */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={regenLoading}
                      onClick={() => handleTriggerQuestionRegen(activeQuestionIdx, 'full')}
                      style={styles.regenBtn}
                      title="Regenerate this question while preserving the rest of the quiz"
                    >
                      <RefreshCw size={13} className={regenLoading ? 'spin' : ''} /> Regenerate Question
                    </button>
                    <button
                      type="button"
                      disabled={regenLoading}
                      onClick={() => handleTriggerQuestionRegen(activeQuestionIdx, 'explanation')}
                      style={styles.secondaryBtn}
                      title="Regenerate only the explanation"
                    >
                      Regen Explanation
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveQuestionToBank(activeQuestion)}
                      style={styles.secondaryBtn}
                      title="Save reviewed question to Topic Question Bank"
                    >
                      <Database size={13} /> Save to Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(activeQuestionIdx)}
                      style={styles.secondaryBtn}
                      title="Duplicate Question"
                    >
                      <Copy size={13} /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestionFromEditor(activeQuestionIdx)}
                      style={{ ...styles.secondaryBtn, color: 'var(--danger)' }}
                      title="Delete Question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Question Metadata Grid */}
                <div style={styles.grid4}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Question Type *</label>
                    <select
                      value={activeQuestion.question_type}
                      onChange={e => updateActiveQuestion({ question_type: e.target.value })}
                      style={styles.input}
                    >
                      {QUESTION_TYPES.map(qt => (
                        <option key={qt.id} value={qt.id}>{qt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Difficulty</label>
                    <select
                      value={activeQuestion.difficulty}
                      onChange={e => updateActiveQuestion({ difficulty: e.target.value })}
                      style={styles.input}
                    >
                      {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Marks *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={activeQuestion.marks}
                      onChange={e => updateActiveQuestion({ marks: parseFloat(e.target.value) || 1 })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Negative Marks</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={activeQuestion.negative_marks || 0}
                      onChange={e => updateActiveQuestion({ negative_marks: parseFloat(e.target.value) || 0 })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.grid2}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Associated Topic</label>
                    <select
                      value={activeQuestion.topic_id || ''}
                      onChange={e => {
                        const tid = e.target.value;
                        const tObj = getTopicsForCourse(quizForm.course_id).find(t => String(t.id) === String(tid));
                        updateActiveQuestion({ topic_id: tid, topic_name: tObj?.name || 'General' });
                      }}
                      style={styles.input}
                    >
                      <option value="">General / Course Topic</option>
                      {getTopicsForCourse(quizForm.course_id).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Image Attachment URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://example.com/diagram.png"
                      value={activeQuestion.image_url || ''}
                      onChange={e => updateActiveQuestion({ image_url: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Question Prompt Textarea */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Question Text *</label>
                  <textarea
                    rows={3}
                    placeholder="Enter clear question prompt..."
                    value={activeQuestion.question_text}
                    onChange={e => updateActiveQuestion({ question_text: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                {/* Dynamic Answer Configuration by Question Type */}
                {(activeQuestion.question_type === 'mcq' || activeQuestion.question_type === 'multiple_select') && (
                  <div style={styles.fieldGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={styles.label}>
                        Answer Options ({activeQuestion.question_type === 'mcq' ? 'Select exactly 1 correct option' : 'Check all correct options'}) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextOpts = [
                            ...(activeQuestion.structured_options || []),
                            { text: '', is_correct: false, display_order: (activeQuestion.structured_options?.length || 0) + 1 }
                          ];
                          updateActiveQuestion({ structured_options: nextOpts });
                        }}
                        style={styles.smallSecondaryBtn}
                      >
                        + Add Option
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      {(activeQuestion.structured_options || []).map((opt, oIdx) => {
                        const letter = ['A', 'B', 'C', 'D', 'E', 'F'][oIdx] || String(oIdx + 1);
                        return (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type={activeQuestion.question_type === 'mcq' ? 'radio' : 'checkbox'}
                              name={`correct-opt-${activeQuestionIdx}`}
                              checked={Boolean(opt.is_correct)}
                              onChange={e => {
                                const updatedOpts = (activeQuestion.structured_options || []).map((item, idx) => {
                                  if (activeQuestion.question_type === 'mcq') {
                                    return { ...item, is_correct: idx === oIdx };
                                  }
                                  return idx === oIdx ? { ...item, is_correct: e.target.checked } : item;
                                });
                                const corrLetters = [];
                                updatedOpts.forEach((item, idx) => {
                                  if (item.is_correct) corrLetters.push(['A', 'B', 'C', 'D', 'E', 'F'][idx] || String(idx + 1));
                                });
                                updateActiveQuestion({
                                  structured_options: updatedOpts,
                                  correct_answer: corrLetters.join(',') || 'A'
                                });
                              }}
                            />
                            <span style={{ fontWeight: '700', width: '22px', color: opt.is_correct ? 'var(--success)' : 'var(--text-muted)' }}>
                              {letter}.
                            </span>
                            <input
                              type="text"
                              placeholder={`Option ${letter} text...`}
                              value={opt.text}
                              onChange={e => {
                                const updatedOpts = [...(activeQuestion.structured_options || [])];
                                updatedOpts[oIdx] = { ...updatedOpts[oIdx], text: e.target.value };
                                updateActiveQuestion({ structured_options: updatedOpts });
                              }}
                              style={{
                                ...styles.input,
                                flexGrow: 1,
                                borderColor: opt.is_correct ? 'var(--success)' : 'var(--border-color)'
                              }}
                            />
                            {(activeQuestion.structured_options?.length || 0) > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = activeQuestion.structured_options.filter((_, idx) => idx !== oIdx);
                                  updateActiveQuestion({ structured_options: filtered });
                                }}
                                style={{ ...styles.iconBtn, color: 'var(--danger)' }}
                                title="Remove Option"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeQuestion.question_type === 'true_false' && (
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Correct Answer (True / False) *</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['True', 'False'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateActiveQuestion({
                            correct_answer: val,
                            structured_options: [
                              { text: 'True', is_correct: val === 'True', display_order: 1 },
                              { text: 'False', is_correct: val === 'False', display_order: 2 }
                            ]
                          })}
                          style={{
                            ...styles.tfChoiceBtn,
                            ...(String(activeQuestion.correct_answer) === val ? styles.tfChoiceBtnActive : {})
                          }}
                        >
                          {val} {String(activeQuestion.correct_answer) === val && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeQuestion.question_type === 'fill_blank' && (
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Correct Blank Answer * (Use | to allow multiple accepted synonyms, e.g., def | define)</label>
                    <input
                      type="text"
                      placeholder="e.g., def"
                      value={activeQuestion.correct_answer || ''}
                      onChange={e => updateActiveQuestion({ correct_answer: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                )}

                {activeQuestion.question_type === 'short_answer' && (
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Expected Answer / Teacher Evaluation Rubric *</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., A list is mutable, whereas a tuple is immutable."
                      value={activeQuestion.correct_answer || ''}
                      onChange={e => updateActiveQuestion({ correct_answer: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>
                )}

                {/* Explanation */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Answer Explanation (Shown after submission when enabled)</label>
                  <textarea
                    rows={2}
                    placeholder="Explain why the answer is correct..."
                    value={activeQuestion.explanation || ''}
                    onChange={e => updateActiveQuestion({ explanation: e.target.value })}
                    style={styles.textarea}
                  />
                </div>
              </div>

              {/* RIGHT PANEL: Live Quiz Summary & Actions */}
              <div className="glass-card" style={styles.rightPanel}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                  Quiz Summary
                </h4>

                <div style={styles.summaryList}>
                  <div style={styles.summaryRow}>
                    <span>Status</span>
                    <strong style={{ color: quizForm.status === 'Published' ? 'var(--success)' : 'var(--warning)' }}>
                      {quizForm.status}
                    </strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Method</span>
                    <strong>{quizForm.creation_method === 'smart' ? '✨ Smart' : '✍️ Manual'}</strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Questions</span>
                    <strong>{quizForm.questions.length}</strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Total Marks</span>
                    <strong style={{ color: 'var(--primary)' }}>{calculatedQuestionMarksSum} pts</strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Passing Marks</span>
                    <strong>{quizForm.passing_marks} pts</strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Duration</span>
                    <strong>{quizForm.duration_minutes} mins</strong>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => handleSaveQuizDraft(false)} disabled={savingQuiz} style={styles.primaryBtn}>
                    <Save size={15} /> {savingQuiz ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button onClick={() => handleSaveQuizDraft(true)} style={styles.secondaryBtn}>
                    <Eye size={15} /> Review & Approve Quiz
                  </button>
                  <button
                    onClick={() => setPublishConfirmQuiz(quizForm)}
                    style={{ ...styles.primaryBtn, backgroundColor: 'var(--success)' }}
                  >
                    <Send size={15} /> Publish Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 4: COMMON QUIZ REVIEW PAGE (Section 8)
      ===================================================================== */}
      {activeView === 'review' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <span style={styles.miniBadge}>TEACHER REVIEW & APPROVAL MODE</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px' }}>
                {quizForm.quiz_title || 'Untitled Quiz'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {quizForm.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => { setEditorStep(2); setActiveView('editor'); }} style={styles.secondaryBtn}>
                <Edit size={15} /> Edit Quiz
              </button>
              <button onClick={() => { handleAddQuestion(); setEditorStep(2); setActiveView('editor'); }} style={styles.secondaryBtn}>
                <Plus size={15} /> Add Question
              </button>
              <button
                onClick={() => {
                  setPreviewAnswers({});
                  setPreviewSubmitted(false);
                  setPreviewTimeRemaining((parseInt(quizForm.duration_minutes, 10) || 20) * 60);
                  setActiveView('student_preview');
                }}
                style={styles.secondaryBtn}
              >
                <Play size={15} /> Preview as Student
              </button>
              <button onClick={() => handleSaveQuizDraft(false)} style={styles.primaryBtn}>
                <Save size={15} /> Save Draft
              </button>
              <button
                onClick={() => setPublishConfirmQuiz(quizForm)}
                style={{ ...styles.primaryBtn, backgroundColor: 'var(--success)' }}
              >
                <Send size={15} /> Publish Quiz
              </button>
            </div>
          </div>

          {/* Quiz Metadata Overview */}
          <div style={styles.grid4}>
            <div style={styles.metaBox}>
              <span>Course & Module</span>
              <strong>{courses.find(c => String(c.course_id) === String(quizForm.course_id))?.course_name || 'Course'} • {quizForm.module_name}</strong>
            </div>
            <div style={styles.metaBox}>
              <span>Questions & Marks</span>
              <strong>{quizForm.questions.length} Questions • {calculatedQuestionMarksSum} Total Marks (Pass: {quizForm.passing_marks})</strong>
            </div>
            <div style={styles.metaBox}>
              <span>Duration & Retakes</span>
              <strong>{quizForm.duration_minutes} Mins • Max {quizForm.max_attempts} Attempts</strong>
            </div>
            <div style={styles.metaBox}>
              <span>Status & Creation</span>
              <strong>{quizForm.status} ({quizForm.creation_method})</strong>
            </div>
          </div>

          {/* Teacher-Only Question & Answer Review List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quizForm.questions.map((q, idx) => (
              <div key={q.id || idx} style={styles.reviewQuestionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--primary)' }}>Q{idx + 1}.</strong>
                    <span style={styles.miniBadge}>{q.question_type.toUpperCase()}</span>
                    <span style={styles.miniBadge}>{q.difficulty}</span>
                    <span style={styles.miniBadge}>Topic: {q.topic_name || 'General'}</span>
                  </div>
                  <strong style={{ fontSize: '0.85rem' }}>{q.marks} Marks</strong>
                </div>

                <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {q.question_text}
                </p>

                {q.structured_options && q.structured_options.length > 0 && (
                  <div style={styles.grid2}>
                    {q.structured_options.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D', 'E', 'F'][oIdx];
                      return (
                        <div key={oIdx} style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: opt.is_correct ? '1px solid var(--success)' : '1px solid var(--border-color)',
                          backgroundColor: opt.is_correct ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)',
                          fontSize: '0.84rem'
                        }}>
                          <strong>{letter}.</strong> {opt.text} {opt.is_correct && <strong style={{ color: 'var(--success)', marginLeft: '6px' }}>✓ Correct</strong>}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--success)', fontWeight: '600' }}>
                  Configured Correct Answer: {q.correct_answer}
                </div>
                {q.explanation && (
                  <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    💡 Explanation: {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 5: SIMULATED STUDENT PREVIEW MODE (Section 8)
      ===================================================================== */}
      {activeView === 'student_preview' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <div>
              <span style={{ ...styles.miniBadge, backgroundColor: 'rgba(2,132,199,0.15)', color: 'var(--primary)' }}>
                STUDENT SIMULATION PREVIEW (Correct answers hidden prior to submission)
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginTop: '6px' }}>{quizForm.quiz_title}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{quizForm.instructions}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontWeight: '700' }}>
                <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {Math.floor(previewTimeRemaining / 60)}:{String(previewTimeRemaining % 60).padStart(2, '0')}
              </div>
              <button onClick={() => setActiveView('editor')} style={styles.secondaryBtn}>
                Exit Student Preview
              </button>
            </div>
          </div>

          {quizForm.questions.map((q, idx) => (
            <div key={q.id || idx} style={styles.reviewQuestionCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>Question {idx + 1}</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{q.marks} Marks</span>
              </div>
              <p style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{q.question_text}</p>

              {(q.question_type === 'mcq' || q.question_type === 'true_false') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(q.structured_options || []).map((opt, oIdx) => {
                    const val = q.question_type === 'true_false' ? opt.text : ['A', 'B', 'C', 'D', 'E', 'F'][oIdx];
                    return (
                      <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`stu-prev-${idx}`}
                          disabled={previewSubmitted}
                          checked={previewAnswers[idx] === val}
                          onChange={() => setPreviewAnswers({ ...previewAnswers, [idx]: val })}
                        />
                        <span>{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.question_type === 'multiple_select' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(q.structured_options || []).map((opt, oIdx) => {
                    const letter = ['A', 'B', 'C', 'D', 'E', 'F'][oIdx];
                    const currentArr = Array.isArray(previewAnswers[idx]) ? previewAnswers[idx] : [];
                    const isChecked = currentArr.includes(letter);
                    return (
                      <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          disabled={previewSubmitted}
                          checked={isChecked}
                          onChange={e => {
                            const next = e.target.checked ? [...currentArr, letter] : currentArr.filter(x => x !== letter);
                            setPreviewAnswers({ ...previewAnswers, [idx]: next });
                          }}
                        />
                        <span>{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {(q.question_type === 'fill_blank' || q.question_type === 'short_answer') && (
                <input
                  type="text"
                  disabled={previewSubmitted}
                  placeholder={q.question_type === 'fill_blank' ? 'Type missing word/keyword...' : 'Write your response...'}
                  value={previewAnswers[idx] || ''}
                  onChange={e => setPreviewAnswers({ ...previewAnswers, [idx]: e.target.value })}
                  style={styles.input}
                />
              )}

              {previewSubmitted && quizForm.show_answers_after_submission && (
                <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)', fontSize: '0.82rem' }}>
                  <strong style={{ color: 'var(--success)' }}>Post-Submission Answer Reveal: {q.correct_answer}</strong>
                  {q.explanation && <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>{q.explanation}</p>}
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {!previewSubmitted ? (
              <button onClick={() => setPreviewSubmitted(true)} style={styles.primaryBtn}>
                Simulate Student Submit
              </button>
            ) : (
              <button onClick={() => { setPreviewSubmitted(false); setPreviewAnswers({}); }} style={styles.secondaryBtn}>
                Reset Student Preview
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 6: TOPIC-BASED QUESTION BANK (Section 12)
      ===================================================================== */}
      {activeView === 'question_bank' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Topic-Based Reusable Question Bank
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Save reviewed questions under course topics and reuse them across semesters. Quizzes receive independent copies so bank edits never alter published quizzes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedBankIds.length > 0 && (
                <button onClick={handleCopySelectedBankToEditor} style={styles.primaryBtn}>
                  <Plus size={15} /> Build Quiz with Selected ({selectedBankIds.length})
                </button>
              )}
              <button
                onClick={() => setEditingBankItem({
                  id: null,
                  course_id: courses[0]?.course_id || 1,
                  topic_id: '',
                  topic_name: 'General',
                  question_text: '',
                  question_type: 'mcq',
                  difficulty: 'Beginner',
                  marks: 2,
                  negative_marks: 0,
                  options: [
                    { text: 'Option A', is_correct: true },
                    { text: 'Option B', is_correct: false },
                    { text: 'Option C', is_correct: false },
                    { text: 'Option D', is_correct: false }
                  ],
                  correct_answer: 'A',
                  explanation: ''
                })}
                style={styles.secondaryBtn}
              >
                + New Bank Question
              </button>
            </div>
          </div>

          {/* Question Bank Filters */}
          <div style={styles.grid5}>
            <input
              type="text"
              placeholder="Search question text or topic..."
              value={bankSearch}
              onChange={e => setBankSearch(e.target.value)}
              style={styles.input}
            />
            <select value={bankCourseFilter} onChange={e => setBankCourseFilter(e.target.value)} style={styles.input}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
            </select>
            <select value={bankTopicFilter} onChange={e => setBankTopicFilter(e.target.value)} style={styles.input}>
              <option value="">All Topics</option>
              {getTopicsForCourse(bankCourseFilter || courses[0]?.course_id).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select value={bankTypeFilter} onChange={e => setBankTypeFilter(e.target.value)} style={styles.input}>
              <option value="All">All Question Types</option>
              {QUESTION_TYPES.map(qt => <option key={qt.id} value={qt.id}>{qt.label}</option>)}
            </select>
            <select value={bankDiffFilter} onChange={e => setBankDiffFilter(e.target.value)} style={styles.input}>
              <option value="All">All Difficulties</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Bank Question List */}
          {loadingBank ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}><RefreshCw size={22} className="spin" /></div>
          ) : bankItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No reusable questions found for this filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bankItems.map(item => {
                const isChecked = selectedBankIds.includes(item.id);
                return (
                  <div key={item.id} style={{
                    ...styles.reviewQuestionCard,
                    borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', flexGrow: 1 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) setSelectedBankIds([...selectedBankIds, item.id]);
                            else setSelectedBankIds(selectedBankIds.filter(id => id !== item.id));
                          }}
                          style={{ marginTop: '4px' }}
                        />
                        <div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span style={styles.miniBadge}>{item.course_name}</span>
                            <span style={{ ...styles.miniBadge, color: 'var(--primary)' }}>Topic: {item.topic_name}</span>
                            <span style={styles.miniBadge}>{item.question_type.toUpperCase()}</span>
                            <span style={styles.miniBadge}>{item.difficulty}</span>
                            <span style={styles.miniBadge}>{item.marks} Marks</span>
                          </div>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.question_text}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '4px' }}>
                            Answer: {item.correct_answer} {item.explanation && `• ${item.explanation}`}
                          </div>
                        </div>
                      </label>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setEditingBankItem(item)}
                          style={styles.iconBtn}
                          title="Edit Reusable Question"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete this question from Question Bank? (Existing quizzes will not be affected)')) return;
                            await quizService.deleteQuestionBankItem(item.id);
                            loadQuestionBank();
                          }}
                          style={{ ...styles.iconBtn, color: 'var(--danger)' }}
                          title="Delete from Bank"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODALS: CREATION METHOD, REGEN CONFIRM, PUBLISH CONFIRM, ANALYTICS
      ===================================================================== */}

      {/* 1. Creation Method Choice Modal (Section 3) */}
      {showMethodModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={{ ...styles.modalBox, maxWidth: '620px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Select Quiz Creation Method</h3>
              <button onClick={() => setShowMethodModal(false)} style={styles.bannerClose}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Both methods use the same 3-panel visual quiz editor and unified database schema.
            </p>
            <div style={styles.grid2}>
              <div onClick={handleStartManualQuiz} style={styles.methodCard}>
                <Edit size={28} color="var(--primary)" />
                <h4 style={{ margin: '10px 0 6px 0' }}>Option A: Manual Quiz Creation</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Author questions, options, answers, negative marking, and explanations step-by-step.
                </p>
              </div>
              <div onClick={handleStartSmartBuilder} style={styles.methodCard}>
                <Sparkles size={28} color="#a78bfa" />
                <h4 style={{ margin: '10px 0 6px 0' }}>Option B: Smart Quiz Builder</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Specify question counts, types, and concepts to prepare an editable quiz draft.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Question-Level Regeneration Side-by-Side Comparison Modal (Section 7) */}
      {regenCandidate && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={{ ...styles.modalBox, maxWidth: '760px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                Do you want to replace this question with the newly generated version?
              </h3>
              <button onClick={() => setRegenCandidate(null)} style={styles.bannerClose}><X size={18} /></button>
            </div>

            <div style={styles.grid2}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={styles.miniBadge}>CURRENT QUESTION (PRESERVED)</span>
                <p style={{ fontWeight: '600', marginTop: '8px', fontSize: '0.9rem' }}>{regenCandidate.oldQuestion.question_text}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Answer: <strong>{regenCandidate.oldQuestion.correct_answer}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {regenCandidate.oldQuestion.explanation}
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid var(--success)' }}>
                <span style={{ ...styles.miniBadge, color: 'var(--success)' }}>NEWLY GENERATED CANDIDATE</span>
                <p style={{ fontWeight: '600', marginTop: '8px', fontSize: '0.9rem' }}>{regenCandidate.newQuestion.question_text}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '6px' }}>
                  Answer: <strong>{regenCandidate.newQuestion.correct_answer}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {regenCandidate.newQuestion.explanation}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button onClick={() => setRegenCandidate(null)} style={styles.secondaryBtn}>Cancel</button>
              <button onClick={handleConfirmReplaceQuestion} style={styles.primaryBtn}>Replace</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Explicit Publish Confirmation Dialog (Section 9) */}
      {publishConfirmQuiz && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={{ ...styles.modalBox, maxWidth: '480px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Confirm Quiz Publication</h3>
              <button onClick={() => setPublishConfirmQuiz(null)} style={styles.bannerClose}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: '12px 0' }}>
              Are you sure you want to publish this quiz?
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Once confirmed, <strong>{publishConfirmQuiz.quiz_title || publishConfirmQuiz.title}</strong> will become accessible to enrolled students according to its configured availability window.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setPublishConfirmQuiz(null)} style={styles.secondaryBtn}>Cancel</button>
              <button
                onClick={handleConfirmPublish}
                disabled={publishing}
                style={{ ...styles.primaryBtn, backgroundColor: 'var(--success)' }}
              >
                {publishing ? 'Publishing...' : 'Publish Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Question Bank Import Modal */}
      {showBankImportModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={{ ...styles.modalBox, maxWidth: '760px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Copy Questions from Topic Question Bank</h3>
              <button onClick={() => setShowBankImportModal(false)} style={styles.bannerClose}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
              {bankItems.map(b => (
                <label key={b.id} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedBankIds.includes(b.id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedBankIds([...selectedBankIds, b.id]);
                      else setSelectedBankIds(selectedBankIds.filter(x => x !== b.id));
                    }}
                  />
                  <div>
                    <span style={styles.miniBadge}>{b.topic_name}</span>{' '}
                    <strong style={{ fontSize: '0.88rem' }}>{b.question_text}</strong>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowBankImportModal(false)} style={styles.secondaryBtn}>Cancel</button>
              <button onClick={handleCopySelectedBankToEditor} disabled={selectedBankIds.length === 0} style={styles.primaryBtn}>
                Copy Selected ({selectedBankIds.length}) to Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Question Bank Create/Edit Modal */}
      {editingBankItem && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={{ ...styles.modalBox, maxWidth: '640px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                {editingBankItem.id ? 'Edit Question Bank Item' : 'Save New Question to Topic Bank'}
              </h3>
              <button onClick={() => setEditingBankItem(null)} style={styles.bannerClose}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div style={styles.grid2}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Course</label>
                  <select
                    value={editingBankItem.course_id}
                    onChange={e => setEditingBankItem({ ...editingBankItem, course_id: e.target.value })}
                    style={styles.input}
                  >
                    {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Topic Name</label>
                  <input
                    type="text"
                    value={editingBankItem.topic_name || ''}
                    onChange={e => setEditingBankItem({ ...editingBankItem, topic_name: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Question Text *</label>
                <textarea
                  rows={3}
                  value={editingBankItem.question_text}
                  onChange={e => setEditingBankItem({ ...editingBankItem, question_text: e.target.value })}
                  style={styles.textarea}
                />
              </div>
              <div style={styles.grid3}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Question Type</label>
                  <select
                    value={editingBankItem.question_type}
                    onChange={e => setEditingBankItem({ ...editingBankItem, question_type: e.target.value })}
                    style={styles.input}
                  >
                    {QUESTION_TYPES.map(qt => <option key={qt.id} value={qt.id}>{qt.label}</option>)}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Difficulty</label>
                  <select
                    value={editingBankItem.difficulty}
                    onChange={e => setEditingBankItem({ ...editingBankItem, difficulty: e.target.value })}
                    style={styles.input}
                  >
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Marks</label>
                  <input
                    type="number"
                    value={editingBankItem.marks}
                    onChange={e => setEditingBankItem({ ...editingBankItem, marks: parseFloat(e.target.value) || 2 })}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Correct Answer *</label>
                <input
                  type="text"
                  value={editingBankItem.correct_answer}
                  onChange={e => setEditingBankItem({ ...editingBankItem, correct_answer: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Explanation</label>
                <textarea
                  rows={2}
                  value={editingBankItem.explanation || ''}
                  onChange={e => setEditingBankItem({ ...editingBankItem, explanation: e.target.value })}
                  style={styles.textarea}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => setEditingBankItem(null)} style={styles.secondaryBtn}>Cancel</button>
                <button
                  onClick={async () => {
                    if (editingBankItem.id) {
                      await quizService.updateQuestionBankItem(editingBankItem);
                    } else {
                      await quizService.saveToQuestionBank(editingBankItem);
                    }
                    setEditingBankItem(null);
                    loadQuestionBank();
                  }}
                  style={styles.primaryBtn}
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Quiz Analytics Modal (Section 16) */}
      {showAnalyticsModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={{ ...styles.modalBox, maxWidth: '820px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                Quiz Performance Analytics: {analyticsData?.quiz?.title || ''}
              </h3>
              <button onClick={() => setShowAnalyticsModal(false)} style={styles.bannerClose}><X size={18} /></button>
            </div>

            {loadingAnalytics ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><RefreshCw size={24} className="spin" /></div>
            ) : analyticsData?.emptyState ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <BarChart3 size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>{analyticsData.emptyState}</p>
              </div>
            ) : analyticsData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                <div style={styles.grid4}>
                  <div style={styles.metaBox}>
                    <span>Total Attempts</span>
                    <strong>{analyticsData.analytics.totalAttempts}</strong>
                  </div>
                  <div style={styles.metaBox}>
                    <span>Average Score</span>
                    <strong style={{ color: 'var(--primary)' }}>{analyticsData.analytics.avgScore}%</strong>
                  </div>
                  <div style={styles.metaBox}>
                    <span>Completion Rate</span>
                    <strong style={{ color: 'var(--success)' }}>{analyticsData.analytics.completionRate}%</strong>
                  </div>
                  <div style={styles.metaBox}>
                    <span>Pass Rate</span>
                    <strong>{analyticsData.analytics.passRate}%</strong>
                  </div>
                </div>

                <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.92rem' }}>Question-Level Correct Answer Percentage</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(analyticsData.analytics.questionAccuracy || []).map(qa => (
                    <div key={qa.question_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.84rem' }}>
                      <span><strong>Q{qa.display_order}:</strong> {qa.question_text} <em>({qa.topic_name})</em></span>
                      <strong style={{ color: 'var(--primary)' }}>{qa.correct_percentage !== null ? `${qa.correct_percentage}%` : 'N/A'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '18px' },
  banner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid'
  },
  bannerClose: { background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' },
  pageTitle: { fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
  pageSubtitle: { fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' },
  topActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  modeTabs: { display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' },
  modeTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modeTabActive: { backgroundColor: 'var(--primary)', color: '#fff' },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '9px',
    border: 'none',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  smartBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '9px',
    border: '1px solid rgba(139,92,246,0.4)',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 13px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  regenBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(139,92,246,0.4)',
    backgroundColor: 'rgba(139,92,246,0.12)',
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  smallPrimaryBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontSize: '0.76rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  smallSecondaryBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.76rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '12px' },
  kpiCard: { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  kpiLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' },
  kpiValue: { fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' },
  filterToolbar: { padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', minWidth: '260px', flexGrow: 1 },
  searchInput: { border: 'none', background: 'transparent', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '0.85rem' },
  filtersWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterSelect: { padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.82rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  tableHeadRow: { borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', textAlign: 'left' },
  th: { padding: '12px 14px', fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' },
  tableRow: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '12px 14px', verticalAlign: 'middle' },
  miniBadge: { fontSize: '0.7rem', padding: '2px 7px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontWeight: '600' },
  statusPill: { padding: '4px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: '700' },
  iconBtn: { padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
  paginationBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border-color)' },
  pageBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.78rem', cursor: 'pointer' },
  smartBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.74rem', fontWeight: '700' },
  errorAlert: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.84rem', fontWeight: '600' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  grid5: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input: { padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.86rem' },
  textarea: { padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.86rem', resize: 'vertical' },
  typeCountBox: { padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' },
  stepBar: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  stepBtn: { padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' },
  stepBtnActive: { backgroundColor: 'rgba(2,132,199,0.15)', borderColor: 'var(--primary)', color: 'var(--primary)' },
  checkboxCard: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer' },
  threePanelGrid: { display: 'grid', gridTemplateColumns: '260px 1fr 250px', gap: '16px', alignItems: 'start' },
  leftPanel: { padding: '14px', maxHeight: '75vh', overflowY: 'auto' },
  questionNavList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  qNavItem: { padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer' },
  qNavItemActive: { borderColor: 'var(--primary)', backgroundColor: 'rgba(2,132,199,0.1)' },
  tinyArrowBtn: { padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' },
  centerPanel: { padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' },
  rightPanel: { padding: '16px' },
  summaryList: { display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tfChoiceBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' },
  tfChoiceBtnActive: { borderColor: 'var(--success)', backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--success)' },
  metaBox: { padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem' },
  reviewQuestionCard: { padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modalBox: { width: '100%', padding: '22px', borderRadius: '14px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  methodCard: { padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.15s ease' }
};
