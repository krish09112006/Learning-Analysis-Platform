import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import CourseSelection from './pages/CourseSelection';

// Teacher Module Pages
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherQuizzes from './pages/teacher/TeacherQuizzes';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import TeacherInterventions from './pages/teacher/TeacherInterventions';
import TeacherReports from './pages/teacher/TeacherReports';
import TeacherModuleShell from './components/teacher/TeacherModuleShell';
import TeacherProfileModal from './components/teacher/TeacherProfileModal';

import authService from './services/authService';
import teacherService from './services/teacherService';
import courseService from './services/courseService';
import progressService from './services/progressService';
import quizService from './services/quizService';
import analyticsService from './services/analyticsService';
import { 
  INITIAL_COURSE, 
  INITIAL_COURSE_SOURCE_VERSION,
  INITIAL_STUDENT_STATE, 
  analyzePerformance 
} from './mockData';

// Helper to create empty state for new students
const createNewStudentState = (name, email) => ({
  profile: {
    name,
    email,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
  },
  completedTopics: [],
  quizAttempts: [],
  assignmentSubmissions: [],
  studySessions: [
    { date: "Mon", hours: 0 },
    { date: "Tue", hours: 0 },
    { date: "Wed", hours: 0 },
    { date: "Thu", hours: 0 },
    { date: "Fri", hours: 0 },
    { date: "Sat", hours: 0 },
    { date: "Sun", hours: 0 }
  ],
  totalStudySeconds: 0
});

export default function App() {
  const courseSourceVersion = INITIAL_COURSE_SOURCE_VERSION;

  // 1. Current Session State
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('lap_current_user');
    return user ? JSON.parse(user) : null;
  });

  const [dbAnalytics, setDbAnalytics] = useState(null);
  const [syncTrigger, setSyncTrigger] = useState(0);

  const [activePage, setActivePage] = useState(() => {
    const user = localStorage.getItem('lap_current_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === 'Teacher') return 'teacher_courses';
      } catch (e) {}
    }
    return 'dashboard';
  });
  const [selectedTopicId, setSelectedTopicId] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState(false);

  // Theme Mode State & Synchronization
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('lap_theme_mode') || 'dark');

  useEffect(() => {
    document.body.className = themeMode === 'light' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('lap_theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load database syllabus, progress, and analytics dynamically for students
  useEffect(() => {
    if (!currentUser || currentUser.role === 'Teacher') return;

    const loadData = async () => {
      const studentId = currentUser.user_id;
      const courseId = selectedCourseId || 'py-101';

      // 0. Check if course exists in local platform courses list
      const localCourses = JSON.parse(localStorage.getItem('lap_courses_list') || '[]');
      const foundLocal = localCourses.find(c => c.course_id === courseId);

      if (foundLocal) {
        setCourseState({
          id: foundLocal.course_id,
          title: foundLocal.course_name,
          instructor: foundLocal.instructor_name || 'Faculty Member',
          topics: foundLocal.topics || [],
          quizzes: foundLocal.quizzes || [],
          modules: foundLocal.modules || []
        });

        if (foundLocal.topics && foundLocal.topics.length > 0) {
          setSelectedTopicId(foundLocal.topics[0].id);
        }

        const loadedState = getStudentStateForUser(currentUser);
        setStudentState(loadedState);
        setDbAnalytics(null);
        return;
      }

      try {
        // 1. Fetch course details & syllabus topics
        const topics = await courseService.getCourseTopics(courseId);
        const quizzes = await quizService.getQuizzes(courseId);
        
        // Load questions for each quiz
        for (let q of quizzes) {
          try {
            q.questions = await quizService.getQuestions(q.id);
          } catch (err) {
            q.questions = [];
          }
        }

        // Update Course state
        setCourseState({
          id: courseId,
          title: courseId === 'py-101' ? 'Python Programming' : 'Academic Course',
          instructor: 'Dr. Alok Verma',
          topics: topics,
          quizzes: quizzes
        });

        // 2. Fetch Progress (completed topics list)
        const progress = await progressService.getProgress(studentId, courseId);

        // 3. Fetch Quiz Results
        const results = await quizService.getQuizResults(studentId, courseId);

        // 4. Fetch Analytics Aggregations
        const analyticsData = await analyticsService.getAnalytics(studentId, courseId);
        setDbAnalytics(analyticsData);

        // Synchronize studentState
        // Construct studySessions grid (using today's weekday to map hours)
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay = daysOfWeek[new Date().getDay()];
        const studySessions = [
          { date: "Mon", hours: 0 },
          { date: "Tue", hours: 0 },
          { date: "Wed", hours: 0 },
          { date: "Thu", hours: 0 },
          { date: "Fri", hours: 0 },
          { date: "Sat", hours: 0 },
          { date: "Sun", hours: 0 }
        ];

        // Map weekly time average or total hours to the studySessions chart
        if (analyticsData && analyticsData.totalStudyHours) {
          const currentDayObj = studySessions.find(s => s.date === currentDay);
          if (currentDayObj) {
            currentDayObj.hours = analyticsData.totalStudyHours;
          }
        }

        setStudentState({
          profile: {
            name: currentUser.name,
            email: currentUser.email,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
          },
          completedTopics: progress.completedTopics || [],
          quizAttempts: results || [],
          assignmentSubmissions: [],
          studySessions,
          totalStudySeconds: progress.totalStudySeconds || 0
        });

      } catch (e) {
        console.warn("PHP Backend offline or unavailable, falling back to local mock data:", e);
        
        // LOAD LOCAL FALLBACK DATA
        const loadedState = getStudentStateForUser(currentUser);
        setStudentState(loadedState);
        setCourseState(INITIAL_COURSE);
        setDbAnalytics(null); // Fallback to calculate performance from local state
      }
    };

    loadData();
  }, [currentUser, syncTrigger, selectedCourseId]);

  // 2. Syllabus state (hoisted to allow dynamic module creation)
  const [courseState, setCourseState] = useState(() => {
    const data = localStorage.getItem('lap_course_data');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.sourceVersion !== courseSourceVersion) {
        return INITIAL_COURSE;
      }
      const totalInitialQuizQs = INITIAL_COURSE.quizzes.reduce((sum, q) => sum + q.questions.length, 0);
      const totalCachedQuizQs = parsed.quizzes ? parsed.quizzes.reduce((sum, q) => sum + q.questions.length, 0) : 0;
      if (!parsed.topics || parsed.topics.length !== INITIAL_COURSE.topics.length || totalCachedQuizQs !== totalInitialQuizQs) {
        return INITIAL_COURSE;
      }
      return parsed;
    }
    return INITIAL_COURSE;
  });

  useEffect(() => {
    const data = localStorage.getItem('lap_course_data');
    const parsed = data ? JSON.parse(data) : null;
    if (parsed?.sourceVersion !== INITIAL_COURSE_SOURCE_VERSION) {
      setCourseState(INITIAL_COURSE);
    }
  }, [courseSourceVersion]);

  // Helper to load user-specific stats
  const getStudentStateForUser = (user) => {
    if (!user) return null;
    const emailKey = user.email.toLowerCase();
    
    // For default demo user, seed initial completed topics & history if not already saved
    if (emailKey === "krish.patel@college.edu") {
      const data = localStorage.getItem('lap_student_state_krish.patel@college.edu');
      return data ? JSON.parse(data) : INITIAL_STUDENT_STATE;
    }
    
    const data = localStorage.getItem(`lap_student_state_${emailKey}`);
    return data ? JSON.parse(data) : createNewStudentState(user.name, user.email);
  };

  // 3. User-Specific Workspace States
  const [studentState, setStudentState] = useState(() => getStudentStateForUser(currentUser));

  const [activityLog, setActivityLog] = useState(() => {
    if (!currentUser) return [];
    const emailKey = currentUser.email.toLowerCase();
    const logs = localStorage.getItem(`lap_activity_logs_${emailKey}`);
    return logs ? JSON.parse(logs) : [
      { text: "Logged into portal student dashboard", time: "Just now" },
      { text: "Enrolled in learning workspace", time: "Just now" }
    ];
  });

  const [notifications, setNotifications] = useState(() => {
    if (!currentUser) return [];
    const emailKey = currentUser.email.toLowerCase();
    const list = localStorage.getItem(`lap_notifications_${emailKey}`);
    return list ? JSON.parse(list) : [
      { id: 1, text: "Welcome to your academic tracking portal! Complete syllabus blocks to aggregate metrics.", unread: true, time: "Just now" }
    ];
  });

  // 4. Timer State
  const [studyTimer, setStudyTimer] = useState({
    isActive: false,
    isPaused: false,
    seconds: 0
  });

  const timerIntervalRef = useRef(null);

  // Sync states on user transitions
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Teacher') {
        teacherService.getNotifications(currentUser.user_id)
          .then(list => {
            if (Array.isArray(list) && list.length > 0) {
              setNotifications(list);
            } else {
              setNotifications([
                { id: 1, text: "Welcome Dr. Verma. All academic courses, student attempts, and evaluations are synced.", unread: false, time: "Just now" }
              ]);
            }
          })
          .catch(() => {
            setNotifications([
              { id: 1, text: "Academic portal ready. MySQL connected.", unread: false, time: "Just now" }
            ]);
          });
      } else {
        const emailKey = currentUser.email.toLowerCase();
        const loadedState = getStudentStateForUser(currentUser);
        setStudentState(loadedState);

        const logs = localStorage.getItem(`lap_activity_logs_${emailKey}`);
        setActivityLog(logs ? JSON.parse(logs) : [
          { text: "Logged into portal student dashboard", time: "Just now" }
        ]);

        const list = localStorage.getItem(`lap_notifications_${emailKey}`);
        setNotifications(list ? JSON.parse(list) : [
          { id: 1, text: "Syllabus workspace loaded successfully. Enroll in Python Programming to begin.", unread: true, time: "Just now" }
        ]);
      }
    } else {
      setStudentState(null);
      setActivityLog([]);
      setNotifications([]);
    }
  }, [currentUser]);

  // Sync courseState to localStorage
  useEffect(() => {
    localStorage.setItem('lap_course_data', JSON.stringify({
      ...courseState,
      sourceVersion: courseSourceVersion
    }));
  }, [courseState, courseSourceVersion]);

  // Sync workspace state to LocalStorage
  useEffect(() => {
    if (currentUser && studentState) {
      const emailKey = currentUser.email.toLowerCase();
      localStorage.setItem(`lap_student_state_${emailKey}`, JSON.stringify(studentState));
    }
  }, [studentState, currentUser]);

  useEffect(() => {
    if (currentUser && activityLog.length > 0) {
      const emailKey = currentUser.email.toLowerCase();
      localStorage.setItem(`lap_activity_logs_${emailKey}`, JSON.stringify(activityLog));
    }
  }, [activityLog, currentUser]);

  useEffect(() => {
    if (currentUser && notifications.length > 0) {
      const emailKey = currentUser.email.toLowerCase();
      localStorage.setItem(`lap_notifications_${emailKey}`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Action: Log Activities
  const logActivity = (text) => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Today)";
    setActivityLog(prev => [{ text, time: timeStr }, ...prev.slice(0, 19)]);
  };

  // Timer handlers
  const startTimer = () => {
    if (studyTimer.isActive && !studyTimer.isPaused) return;

    setStudyTimer(prev => ({
      ...prev,
      isActive: true,
      isPaused: false
    }));

    timerIntervalRef.current = setInterval(() => {
      setStudyTimer(prev => ({
        ...prev,
        seconds: prev.seconds + 1
      }));
    }, 1000);

    logActivity("Started active study session");
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setStudyTimer(prev => ({
      ...prev,
      isPaused: true
    }));
    logActivity("Paused study session");
  };

  const stopTimer = async () => {
    if (!studyTimer.isActive) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const elapsedSeconds = studyTimer.seconds;
    const elapsedMinutes = Math.round(elapsedSeconds / 60) || 1;

    try {
      // Save study time to active topic in database
      await progressService.saveProgress(
        currentUser.user_id,
        'py-101',
        selectedTopicId,
        false,
        null,
        elapsedSeconds
      );
      
      logActivity(`Completed study session. Duration: ${elapsedMinutes} minute(s)`);
      alert(`⏱️ Session Logged:\n\nYou studied for ${elapsedMinutes} minute(s). Progress saved to total study time!`);
      setSyncTrigger(prev => prev + 1);
    } catch (e) {
      console.error("Failed to log study session time to DB:", e);
    }

    setStudyTimer({
      isActive: false,
      isPaused: false,
      seconds: 0
    });
  };

  // Auth Portal callbacks
  const handleAuthSuccess = (user) => {
    localStorage.setItem('lap_current_user', JSON.stringify(user));
    setCurrentUser(user);
    if (user?.role === 'Teacher') {
      setActivePage('teacher_courses');
    } else {
      setActivePage('dashboard');
    }
  };

  const handleLogout = () => {
    if (studyTimer.isActive) {
      stopTimer();
    }
    localStorage.removeItem('lap_current_user');
    setCurrentUser(null);
  };

  // Catalog selection
  const handleEnrollCourse = async (courseId) => {
    try {
      // Try database enrollment first
      await courseService.enrollInCourse(currentUser.user_id, courseId);
      
      const updatedUser = {
        ...currentUser,
        enrolledCourses: [...(currentUser.enrolledCourses || []), courseId]
      };
      
      // Commit current user state
      localStorage.setItem('lap_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setSelectedCourseId(courseId);
      setSyncTrigger(prev => prev + 1);

      // Seed enrollment alert in notifications
      setNotifications(prev => [
        { id: Date.now(), text: "Successfully enrolled in Python Programming! Create or add syllabus topics to begin.", unread: true, time: "Just now" },
        ...prev
      ]);
    } catch (e) {
      console.warn("Backend API offline during enrollment, falling back to mock enrollment locally:", e);
      
      // FALLBACK TO OFFLINE MOCK ENROLLMENT
      const updatedUser = {
        ...currentUser,
        enrolledCourses: [...(currentUser.enrolledCourses || []), courseId]
      };
      
      // Sync to user profiles list
      const db = JSON.parse(localStorage.getItem('lap_users_db') || '[]');
      const updatedDB = db.map(u => {
        if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return { ...u, enrolledCourses: updatedUser.enrolledCourses };
        }
        return u;
      });
      localStorage.setItem('lap_users_db', JSON.stringify(updatedDB));
      
      // Commit current user state
      localStorage.setItem('lap_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setSelectedCourseId(courseId);
      
      setNotifications(prev => [
        { id: Date.now(), text: "Successfully enrolled in Python Programming (Offline)! Create or add syllabus topics to begin.", unread: true, time: "Just now" },
        ...prev
      ]);
    }
  };

  const handleLeaveCourse = () => {
    const updatedUser = {
      ...currentUser,
      enrolledCourses: []
    };
    
    // Commit current user state
    localStorage.setItem('lap_current_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setSelectedCourseId(null);
    setSyncTrigger(prev => prev + 1);
    
    logActivity("Left Python Programming workspace to browse course registry catalog");
  };

  // Dynamic syllabus topic manager
  const handleAddTopic = (templateTopicId, customName, customDesc, category) => {
    let newTopic = null;
    
    if (templateTopicId) {
      // Find template
      const template = PYTHON_TOPICS_TEMPLATES.find(t => t.id === Number(templateTopicId));
      if (template) {
        // Verify duplicates
        const alreadyExists = courseState.topics.some(t => t.name === template.name);
        if (alreadyExists) {
          alert(`Topic "${template.name}" is already in the syllabus.`);
          return;
        }
        newTopic = {
          ...template,
          id: courseState.topics.length + 1
        };
      }
    } else {
      // Custom topic creation
      const newId = courseState.topics.length + 1;
      newTopic = {
        id: newId,
        category: category || "Python Fundamentals",
        name: customName,
        description: customDesc,
        learningObjectives: [
          `Master core methodologies of ${customName}`,
          `Understand syntax configurations for ${customName}`,
          `Integrate loops or logic patterns using ${customName}`
        ],
        conceptExplanation: `This custom module covers core methodologies regarding ${customName}. Study the reference guides and try variables and control declarations locally inside your editor environment.`,
        syntax: `# Syntax definition\n# Declare ${customName} here`,
        example: `# Example code implementation\nprint("Running ${customName} demo code...")`,
        output: `Running ${customName} demo code...`,
        materials: [
          { id: `m${newId}-1`, type: "pdf", title: `${customName} Reference Manual.pdf`, size: "1.2 MB", url: "#" },
          { id: `m${newId}-2`, type: "video", title: `Lecture on ${customName}`, duration: "15 mins", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
        ],
        assignment: {
          id: `a${newId}`,
          title: `Assignment ${newId}: Practice on ${customName}`,
          description: `Write and submit a program that showcases concepts learned in the ${customName} module.`,
          dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
        },
        quiz: {
          id: `q${newId}`,
          title: `Quiz ${newId}: ${customName} basics`,
          questions: Array.from({ length: 10 }, (_, index) => ({
            id: `q${newId}-${index + 1}`,
            question: `Question ${index + 1}: What is correct regarding ${customName}?`,
            options: [
              `Standard operation for ${customName} (Correct)`,
              "Secondary incorrect execution option",
              "Unsupported namespace statement",
              "None of the above"
            ],
            correctAnswer: 0
          }))
        }
      };
    }

    if (newTopic) {
      setCourseState(prev => {
        const updatedCourse = {
          ...prev,
          topics: [...prev.topics, newTopic]
        };
        localStorage.setItem('lap_course_data', JSON.stringify(updatedCourse));
        return updatedCourse;
      });
      
      logActivity(`Created and added syllabus module: "${newTopic.name}"`);
      
      setNotifications(prev => [
        { id: Date.now(), text: `New syllabus module "${newTopic.name}" has been created. Notes, assignments and quizzes are available!`, unread: true, time: "Just now" },
        ...prev
      ]);
    }
  };

  // Topic Completion Toggles
  const handleMarkTopicCompleted = async (topicId) => {
    if (!studentState) return;
    const isCompleted = studentState.completedTopics.includes(topicId);
    try {
      await progressService.saveProgress(
        currentUser.user_id,
        'py-101',
        topicId,
        !isCompleted,
        !isCompleted ? 100.00 : 0.00
      );
      
      const topicObj = courseState.topics.find(t => t.id === topicId);
      if (isCompleted) {
        logActivity(`Removed topic completion: "${topicObj?.name}"`);
      } else {
        logActivity(`Marked topic as completed: "${topicObj?.name}"`);
      }
      setSyncTrigger(prev => prev + 1);
    } catch (e) {
      console.error("Failed to save progress completion to DB:", e);
    }
  };

  // Quiz submission callback
  const handleQuizAttempt = (quizId, correctScore, totalQuestions) => {
    setSyncTrigger(prev => prev + 1);
  };

  // File assignment submissions
  const handleAssignmentSubmit = (assignmentId, filename) => {
    if (!studentState) return;
    setStudentState(prev => {
      const otherSubmissions = prev.assignmentSubmissions.filter(s => s.assignmentId !== assignmentId);
      return {
        ...prev,
        assignmentSubmissions: [
          ...otherSubmissions,
          {
            assignmentId,
            file: filename,
            status: "Submitted",
            grade: null,
            date: "Just now"
          }
        ]
      };
    });
  };

  // Settings modification
  const handleUpdateProfile = async (name, email) => {
    if (!studentState) return;
    try {
      await authService.updateProfile(currentUser.user_id, name);
      
      setStudentState(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name,
          email
        }
      }));
      
      // Sync back name to current session user
      const updatedUser = { ...currentUser, name };
      localStorage.setItem('lap_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      logActivity(`Updated profile details: Name to "${name}"`);
      setSyncTrigger(prev => prev + 1);
    } catch (e) {
      alert("Failed to update profile: " + e.message);
    }
  };

  // Hard Reset workspace state
  const handleResetProgress = () => {
    if (!currentUser) return;
    const emailKey = currentUser.email.toLowerCase();
    
    localStorage.removeItem(`lap_student_state_${emailKey}`);
    localStorage.removeItem(`lap_activity_logs_${emailKey}`);
    localStorage.removeItem(`lap_notifications_${emailKey}`);
    localStorage.removeItem('lap_course_data');
    
    setCourseState(INITIAL_COURSE);

    if (emailKey === "krish.patel@college.edu") {
      setStudentState(INITIAL_STUDENT_STATE);
      setActivityLog([
        { text: "Portal state initialized to default values (0% progress, syllabus cleared)", time: "Just now" }
      ]);
      setNotifications([
        { id: 1, text: "Demo profile reset. Enroll in course and add modules to generate advisor insights.", unread: true, time: "Just now" }
      ]);
    } else {
      setStudentState(createNewStudentState(currentUser.name, currentUser.email));
      setActivityLog([
        { text: "Workspace profile initialized to 0% progress, syllabus cleared", time: "Just now" }
      ]);
      setNotifications([
        { id: 1, text: "Syllabus cleared. Click Add Module to populate your course pathways.", unread: true, time: "Just now" }
      ]);
    }

    alert("🔄 Workspace cleared! Syllabus modules and progress metrics are reset.");
    setActivePage('dashboard');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false, is_read: 1 })));
    if (currentUser?.role === 'Teacher') {
      teacherService.markAllNotificationsRead(currentUser.user_id).catch(() => {});
    }
  };

  // --- ROUTING ENGINE ---
  const isTeacher = currentUser?.role === 'Teacher';
  
  // Rule A: Not authenticated ➜ Auth portal
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Rule B: Land student on catalog selection page first when logging in (selectedCourseId === null)
  // Teachers skip this catalog gate
  if (!isTeacher && !selectedCourseId) {
    return (
      <CourseSelection 
        student={currentUser} 
        onEnroll={handleEnrollCourse} 
        onSelectCourse={setSelectedCourseId} 
      />
    );
  }

  // Rule C: Fully authenticated ➜ Workspace Layout
  const analytics = studentState ? analyzePerformance(studentState, courseState) : {
    progressPercent: 0,
    avgQuizScore: 0,
    totalQuizzesAttempted: 0,
    submittedAssignmentsCount: 0,
    topicAnalysis: [],
    weakTopics: [],
    goodTopics: [],
    strongTopics: [],
    pendingWork: []
  };

  return (
    <div style={styles.appLayout}>
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        studentName={currentUser.name}
        userRole={currentUser.role || 'Student'}
        onLogout={handleLogout}
        onOpenProfile={() => setIsTeacherProfileOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div style={styles.contentWrapper}>
        
        {/* Header toolbar */}
        <Header 
          student={studentState || { profile: { name: currentUser.name, email: currentUser.email } }}
          studyTimer={studyTimer}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          stopTimer={stopTimer}
          notifications={notifications}
          markNotificationsAsRead={markNotificationsAsRead}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          userRole={currentUser.role || 'Student'}
          onOpenProfile={() => setIsTeacherProfileOpen(true)}
        />

        {/* View Port Outlet */}
        <main style={styles.pageOutlet}>
          {isTeacher ? (
            <>
              {(activePage === 'teacher_quizzes' || activePage === 'teacher_smart_quiz' || activePage === 'teacher_question_bank') ? (
                <TeacherQuizzes
                  teacher={currentUser}
                  currentUser={currentUser}
                  initialTab={
                    activePage === 'teacher_smart_quiz'
                      ? 'smart_builder'
                      : activePage === 'teacher_question_bank'
                      ? 'question_bank'
                      : 'dashboard'
                  }
                />
              ) : activePage === 'teacher_courses' ? (
                <TeacherCourses
                  teacher={currentUser}
                  currentUser={currentUser}
                  onCourseSelect={setSelectedCourseId}
                  onOpenQuizzes={() => setActivePage('teacher_quizzes')}
                />
              ) : activePage === 'teacher_assignments' ? (
                <TeacherAssignments teacher={currentUser} />
              ) : activePage === 'teacher_dashboard' ? (
                <TeacherDashboard teacher={currentUser} setActivePage={setActivePage} setSelectedCourseId={setSelectedCourseId} />
              ) : activePage === 'teacher_analytics' ? (
                <TeacherAnalytics teacher={currentUser} />
              ) : activePage === 'teacher_interventions' ? (
                <TeacherInterventions teacher={currentUser} />
              ) : activePage === 'teacher_reports' ? (
                <TeacherReports teacher={currentUser} />
              ) : (
                <TeacherModuleShell
                  moduleKey={activePage}
                  setActivePage={setActivePage}
                />
              )}
            </>
          ) : (
            <>
              {studentState && activePage === 'dashboard' && (
                <Dashboard 
                  student={studentState}
                  course={courseState}
                  analytics={analytics}
                  studyTimer={studyTimer}
                  startTimer={startTimer}
                  pauseTimer={pauseTimer}
                  stopTimer={stopTimer}
                  setActivePage={setActivePage}
                  setSelectedTopicId={setSelectedTopicId}
                />
              )}

              {studentState && activePage === 'courses' && (
                <Courses 
                  student={studentState}
                  course={courseState}
                  onMarkTopicCompleted={handleMarkTopicCompleted}
                  onQuizAttempt={handleQuizAttempt}
                  onAssignmentSubmit={handleAssignmentSubmit}
                  logActivity={logActivity}
                  selectedTopicId={selectedTopicId}
                  setSelectedTopicId={setSelectedTopicId}
                  onLogout={handleLogout}
                  onResetProgress={handleResetProgress}
                  onLeaveCourse={handleLeaveCourse}
                  setActivePage={setActivePage}
                />
              )}

              {activePage === 'analytics' && (
                <Analytics 
                  student={studentState}
                  course={courseState}
                  analytics={analytics}
                  currentUser={currentUser}
                  setActivePage={setActivePage}
                  setSelectedTopicId={setSelectedTopicId}
                />
              )}

              {studentState && activePage === 'profile' && (
                <Profile 
                  student={studentState}
                  updateProfile={handleUpdateProfile}
                  activityLog={activityLog}
                  onResetProgress={handleResetProgress}
                />
              )}
            </>
          )}
        </main>

      </div>

      {/* Teacher Profile & Settings Modal */}
      {isTeacher && (
        <TeacherProfileModal
          isOpen={isTeacherProfileOpen}
          onClose={() => setIsTeacherProfileOpen(false)}
          teacher={currentUser}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('lap_current_user', JSON.stringify(updated));
          }}
        />
      )}

    </div>
  );
}

const styles = {
  appLayout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    transition: 'background-color var(--transition-normal), color var(--transition-normal)',
  },
  contentWrapper: {
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: '100vh',
  },
  pageOutlet: {
    marginTop: '80px',
    padding: '2rem',
    flexGrow: 1,
  },
};
