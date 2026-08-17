import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import CourseSelection from './pages/CourseSelection';
import { 
  INITIAL_COURSE, 
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
  // 1. Current Session State
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('lap_current_user');
    return user ? JSON.parse(user) : null;
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState(1);

  // Theme Mode State & Synchronization
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('lap_theme_mode') || 'dark');

  useEffect(() => {
    document.body.className = themeMode === 'light' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('lap_theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // 2. Syllabus state (hoisted to allow dynamic module creation)
  const [courseState, setCourseState] = useState(() => {
    const data = localStorage.getItem('lap_course_data');
    if (data) {
      const parsed = JSON.parse(data);
      const totalInitialQuizQs = INITIAL_COURSE.quizzes.reduce((sum, q) => sum + q.questions.length, 0);
      const totalCachedQuizQs = parsed.quizzes ? parsed.quizzes.reduce((sum, q) => sum + q.questions.length, 0) : 0;
      if (!parsed.topics || parsed.topics.length !== INITIAL_COURSE.topics.length || totalCachedQuizQs !== totalInitialQuizQs) {
        return INITIAL_COURSE;
      }
      return parsed;
    }
    return INITIAL_COURSE;
  });

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
    } else {
      setStudentState(null);
      setActivityLog([]);
      setNotifications([]);
    }
  }, [currentUser]);

  // Sync courseState to localStorage
  useEffect(() => {
    localStorage.setItem('lap_course_data', JSON.stringify(courseState));
  }, [courseState]);

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

  const stopTimer = () => {
    if (!studyTimer.isActive) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const elapsedSeconds = studyTimer.seconds;
    const elapsedMinutes = Math.round(elapsedSeconds / 60) || 1;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = daysOfWeek[new Date().getDay()];
    const addedHours = Number((elapsedSeconds / 3600).toFixed(3));

    setStudentState(prev => {
      if (!prev) return prev;
      const updatedSessions = prev.studySessions.map(session => {
        if (session.date === currentDay) {
          return { ...session, hours: Number((session.hours + addedHours).toFixed(1)) };
        }
        return session;
      });

      return {
        ...prev,
        totalStudySeconds: prev.totalStudySeconds + elapsedSeconds,
        studySessions: updatedSessions
      };
    });

    logActivity(`Completed study session. Duration: ${elapsedMinutes} minute(s)`);
    alert(`⏱️ Session Logged:\n\nYou studied for ${elapsedMinutes} minute(s). Progress saved to total study time!`);

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
  };

  const handleLogout = () => {
    if (studyTimer.isActive) {
      stopTimer();
    }
    localStorage.removeItem('lap_current_user');
    setCurrentUser(null);
  };

  // Catalog selection
  const handleEnrollCourse = (courseId) => {
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
    
    // Seed enrollment alert in notifications
    setNotifications(prev => [
      { id: Date.now(), text: "Successfully enrolled in Python Programming! Create or add syllabus topics to begin.", unread: true, time: "Just now" },
      ...prev
    ]);
  };

  const handleLeaveCourse = () => {
    const updatedUser = {
      ...currentUser,
      enrolledCourses: []
    };
    
    // Sync to user profiles list
    const db = JSON.parse(localStorage.getItem('lap_users_db') || '[]');
    const updatedDB = db.map(u => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return { ...u, enrolledCourses: [] };
      }
      return u;
    });
    localStorage.setItem('lap_users_db', JSON.stringify(updatedDB));
    
    // Commit current user state
    localStorage.setItem('lap_current_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    
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
  const handleMarkTopicCompleted = (topicId) => {
    if (!studentState) return;
    setStudentState(prev => {
      const isCompleted = prev.completedTopics.includes(topicId);
      let updatedList;
      if (isCompleted) {
        updatedList = prev.completedTopics.filter(id => id !== topicId);
        logActivity(`Removed topic completion: "${courseState.topics.find(t => t.id === topicId).name}"`);
      } else {
        updatedList = [...prev.completedTopics, topicId];
        logActivity(`Marked topic as completed: "${courseState.topics.find(t => t.id === topicId).name}"`);
      }
      return {
        ...prev,
        completedTopics: updatedList
      };
    });
  };

  // Quiz submission
  const handleQuizAttempt = (quizId, correctScore, totalQuestions) => {
    if (!studentState) return;
    const percent = Math.round((correctScore / totalQuestions) * 100);
    setStudentState(prev => {
      const otherAttempts = prev.quizAttempts.filter(q => q.quizId !== quizId);
      return {
        ...prev,
        quizAttempts: [
          ...otherAttempts,
          {
            quizId,
            score: correctScore,
            total: totalQuestions,
            percent,
            timestamp: "Just now"
          }
        ]
      };
    });
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
  const handleUpdateProfile = (name, email) => {
    if (!studentState) return;
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
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // --- ROUTING ENGINE ---
  
  // Rule A: Student not authenticated ➜ Auth portal
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Rule B: Student authenticated but not enrolled in the Python Course ➜ Catalog
  const enrolled = currentUser.enrolledCourses && currentUser.enrolledCourses.includes('py-101');
  if (!enrolled) {
    return <CourseSelection student={currentUser} onEnroll={handleEnrollCourse} />;
  }

  // Rule C: Fully authenticated & Enrolled ➜ Workspace Layout
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
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div style={styles.contentWrapper}>
        
        {/* Header toolbar */}
        {studentState && (
          <Header 
            student={studentState}
            studyTimer={studyTimer}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            stopTimer={stopTimer}
            notifications={notifications}
            markNotificationsAsRead={markNotificationsAsRead}
            themeMode={themeMode}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* View Port Outlet */}
        <main style={styles.pageOutlet}>
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

          {studentState && activePage === 'analytics' && (
            <Analytics 
              student={studentState}
              course={courseState}
              analytics={analytics}
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
        </main>

      </div>

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
