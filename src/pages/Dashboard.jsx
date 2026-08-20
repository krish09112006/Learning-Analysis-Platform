import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowRight, 
  BarChart3, 
  Award, 
  HelpCircle 
} from 'lucide-react';

export default function Dashboard({ 
  student, 
  course, 
  analytics, 
  studyTimer, 
  startTimer, 
  pauseTimer, 
  stopTimer, 
  setActivePage,
  setSelectedTopicId
}) {
  
  // Format seconds to readable h and m
  const formatTotalTime = (seconds) => {
    if (!seconds || seconds === 0) return { main: "0h 0m", desc: "No study sessions yet" };
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return { main: `${hrs}h ${mins}m`, desc: "Total study time" };
  };

  // Live timer format for Dashboard Widget
  const formatTimer = (secs) => {
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Find next pending topic
  const nextTopic = course.topics ? course.topics.find(t => !student.completedTopics.includes(t.id)) : null;
  const currentLearningTopic = nextTopic || (course.topics && course.topics.length > 0 ? course.topics[0] : null);

  const handleContinueStudy = () => {
    if (currentLearningTopic) {
      setSelectedTopicId(currentLearningTopic.id);
      setActivePage('courses');
    }
  };

  // Dynamic status checks
  const totalTopics = course.topics ? course.topics.length : 0;
  const completedTopicsCount = student.completedTopics ? student.completedTopics.length : 0;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  const hasLearningActivity = completedTopicsCount > 0;
  const hasQuizAttempts = student.quizAttempts && student.quizAttempts.length > 0;
  const hasStudySessions = student.totalStudySeconds > 0;

  // Study hours formatting
  const studyTimeData = formatTotalTime(student.totalStudySeconds);

  // Quiz averages
  const avgQuizScore = hasQuizAttempts 
    ? Math.round(student.quizAttempts.reduce((sum, item) => sum + item.percent, 0) / student.quizAttempts.length)
    : '—';

  // Weak topics calculation from actual performance (Score < 60%)
  // Mapped modules attempted with their scores
  const attemptedModulesWithScores = course.quizzes ? course.quizzes.map(q => {
    const attempt = student.quizAttempts.find(a => a.quizId === q.id);
    return {
      name: q.title.replace("Quiz: ", "").replace(" Mastery", ""),
      score: attempt ? attempt.percent : null
    };
  }).filter(item => item.score !== null) : [];

  const weakTopicsList = attemptedModulesWithScores.filter(item => item.score < 60);
  const weakTopicsCount = weakTopicsList.length;

  // Recommended learning builder
  const getRecommendations = () => {
    if (!hasLearningActivity) {
      return [
        { id: 1, text: "Start Python Programming Course", type: "course" },
        { id: 2, text: "Begin Module 1: Introduction to Python", type: "topic" },
        { id: 3, text: "Take your first practice quiz", type: "quiz" }
      ];
    }
    
    const recs = [];
    if (weakTopicsList.length > 0) {
      recs.push({
        id: 1,
        text: `Review concepts for: "${weakTopicsList[0].name}"`,
        type: "review"
      });
    }
    if (currentLearningTopic) {
      recs.push({
        id: 2,
        text: `Continue with: "${currentLearningTopic.name}"`,
        type: "topic"
      });
    }
    recs.push({
      id: 3,
      text: "Start a study session to track active time",
      type: "study"
    });
    return recs;
  };

  const recommendations = getRecommendations();

  // Donut chart segments for courses
  const courseOverview = {
    inProgress: progressPercent > 0 && progressPercent < 100 ? 1 : 0,
    completed: progressPercent === 100 ? 1 : 0,
    notStarted: progressPercent === 0 ? 1 : 0,
    total: 1
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Upper Grid: KPI Summary Cards */}
      <div style={styles.statsGrid}>
        
        {/* Overall Progress Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Overall Progress</span>
            <BookOpen size={18} color="var(--primary)" />
          </div>
          <div style={styles.progressContainer}>
            <div style={styles.progressCircle}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-secondary)" strokeWidth="6" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="6" 
                  strokeDasharray="213.6" 
                  strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <span style={styles.progressText}>{progressPercent}%</span>
            </div>
            <div>
              <h4 style={styles.progressValue}>{completedTopicsCount} / {totalTopics}</h4>
              <span style={styles.progressLabel}>Topics Completed</span>
            </div>
          </div>
        </div>

        {/* Study Duration Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Study Duration</span>
            <Clock size={18} color="var(--primary)" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.hugeText}>{studyTimeData.main}</h3>
            <p style={styles.statDesc}>{studyTimeData.desc}</p>
          </div>
        </div>

        {/* Quiz Performance Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Quiz Performance</span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.hugeText}>
              {avgQuizScore !== '—' ? `${avgQuizScore}%` : '—'}
            </h3>
            <p style={styles.statDesc}>
              {hasQuizAttempts ? `Average Score, ${student.quizAttempts.length} Quizzes Attempted` : 'No quizzes attempted'}
            </p>
          </div>
        </div>

        {/* Weak Topics Card */}
        <div className="glass-card" style={{
          ...styles.statCard, 
          borderLeft: weakTopicsCount > 0 ? '3px solid var(--danger)' : '1px solid var(--border-color)'
        }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Weak Topics</span>
            <AlertTriangle size={18} color={weakTopicsCount > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.hugeText}>{hasQuizAttempts ? weakTopicsCount : 0}</h3>
            <p style={styles.statDesc}>
              {hasQuizAttempts ? 'Topics need improvement' : 'No weak topics identified'}
            </p>
          </div>
        </div>

      </div>

      {/* Row 1: Course Continue (left) & Course Overview (right) */}
      <div style={styles.chartsGrid}>
        
        {/* Continue Learning Course Card */}
        <div className="glass-card" style={styles.courseContinueCard}>
          <div style={styles.courseMeta}>
            <span style={styles.courseTag}>Active Course</span>
          </div>
          <h3 style={styles.courseTitle}>{course.title}</h3>
          <p style={styles.courseDesc}>{course.description}</p>
          
          <div style={styles.divider} />
          
          <div style={styles.nextTopicBlock}>
            <span style={styles.nextLabel}>Up Next:</span>
            {currentLearningTopic ? (
              <h4 style={styles.nextTopicName}>{currentLearningTopic.name}</h4>
            ) : (
              <h4 style={styles.nextTopicName}>No Topics Added Yet</h4>
            )}
          </div>

          <button 
            onClick={handleContinueStudy} 
            disabled={!currentLearningTopic}
            style={{
              ...styles.continueBtn,
              opacity: currentLearningTopic ? 1 : 0.5,
              cursor: currentLearningTopic ? 'pointer' : 'not-allowed'
            }}
          >
            Continue Learning <ArrowRight size={16} />
          </button>
        </div>

        {/* Course Overview (Donut Chart) */}
        <div className="glass-card" style={styles.panelCard}>
          <h3 style={styles.panelTitle}>Course Overview</h3>
          {progressPercent === 0 && !hasLearningActivity && !hasQuizAttempts ? (
            <EmptyState 
              title="No courses started"
              desc="Enroll in a course to start tracking your learning journey."
              icon={Award}
            />
          ) : (
            <div style={styles.donutContainer}>
              <svg viewBox="0 0 160 160" style={styles.donutSvg}>
                {/* Background Ring */}
                <circle cx="80" cy="80" r="50" fill="none" stroke="var(--bg-secondary)" strokeWidth="18" />
                
                {/* Segments */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r="50" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="18" 
                  strokeDasharray="314.15" 
                  strokeDashoffset={314.15 - (314.15 * progressPercent) / 100}
                  transform="rotate(-90 80 80)"
                  strokeLinecap="round"
                />
                
                {/* Center Content */}
                <text x="80" y="78" fill="var(--text-primary)" fontSize="18" fontWeight="bold" textAnchor="middle">1</text>
                <text x="80" y="93" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Active Course</text>
              </svg>
              
              <div style={styles.donutLegend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: 'var(--primary)' }} />
                  <span style={styles.legendText}>In Progress: 1 (100%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Row 2: Topic Performance (left) & Quiz Performance (right) */}
      <div style={styles.chartsGrid}>
        
        {/* Topic performance horizontal progress meters */}
        <div className="glass-card" style={styles.panelCard}>
          <h3 style={styles.panelTitle}>Topic Performance</h3>
          {attemptedModulesWithScores.length === 0 ? (
            <EmptyState 
              title="No topic data available"
              desc="Complete topics and quizzes to see your performance."
              icon={BarChart3}
            />
          ) : (
            <div style={styles.topicMetersContainer}>
              {attemptedModulesWithScores.map((item, idx) => (
                <div key={idx} style={styles.topicMeterRow}>
                  <div style={styles.topicMeterHeader}>
                    <span style={styles.topicMeterName}>{item.name}</span>
                    <span style={styles.topicMeterPercent}>{item.score}%</span>
                  </div>
                  <div style={styles.topicMeterTrack}>
                    <div style={{
                      ...styles.topicMeterFill,
                      width: `${item.score}%`,
                      backgroundColor: item.score < 60 ? 'var(--danger)' : item.score < 80 ? 'var(--warning)' : 'var(--success)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Performance Card */}
        <div className="glass-card" style={styles.panelCard}>
          <h3 style={styles.panelTitle}>Quiz Performance</h3>
          {!hasQuizAttempts ? (
            <EmptyState 
              title="No quiz attempts yet"
              desc="Attempt your first quiz to see your performance analytics."
              icon={Award}
            />
          ) : (
            <div style={styles.chartContainer}>
              <svg viewBox="0 0 240 180" style={styles.chartSvg}>
                <line x1="20" y1="20" x2="220" y2="20" stroke="var(--border-color)" strokeDasharray="3,3" />
                <line x1="20" y1="75" x2="220" y2="75" stroke="var(--border-color)" strokeDasharray="3,3" />
                <line x1="20" y1="130" x2="220" y2="130" stroke="var(--border-color)" strokeDasharray="3,3" />
                <line x1="20" y1="150" x2="220" y2="150" stroke="var(--border-color)" />

                {student.quizAttempts.slice(0, 5).map((q, idx) => {
                  const x = 30 + (idx * 40);
                  const h = 130 * (q.percent / 100);
                  const y = 150 - h;
                  return (
                    <g key={q.id || idx}>
                      <rect x={x} y={y} width="20" height={h} rx="3" fill="var(--primary)" />
                      <text x={x + 10} y="165" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{`Q${idx + 1}`}</text>
                      <text x={x + 10} y={y - 5} fill="var(--text-primary)" fontSize="8" fontWeight="bold" textAnchor="middle">{`${q.percent}%`}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

      </div>

      {/* Row 3: Study Activity (left) & Topics That Need Improvement (right) */}
      <div style={styles.chartsGrid}>
        
        {/* Study Hours Card */}
        <div className="glass-card" style={styles.panelCard}>
          <h3 style={styles.panelTitle}>Study Activity</h3>
          {!hasStudySessions ? (
            <EmptyState 
              title="No study sessions yet"
              desc="Start a study session to track your learning time."
              icon={Clock}
            />
          ) : (
            <div style={styles.chartContainer}>
              <svg viewBox="0 0 240 180" style={styles.chartSvg}>
                <line x1="20" y1="20" x2="220" y2="20" stroke="var(--border-color)" strokeDasharray="3,3" />
                <line x1="20" y1="75" x2="220" y2="75" stroke="var(--border-color)" strokeDasharray="3,3" />
                <line x1="20" y1="130" x2="220" y2="130" stroke="var(--border-color)" strokeDasharray="3,3" />
                <line x1="20" y1="150" x2="220" y2="150" stroke="var(--border-color)" />

                {student.studySessions.map((session, idx) => {
                  const x = 25 + (idx * 27);
                  const maxHrs = 5;
                  const h = Math.min(130, 130 * (session.hours / maxHrs));
                  const y = 150 - h;
                  return (
                    <g key={session.date || idx}>
                      <rect x={x} y={y} width="12" height={h} rx="2" fill="var(--primary)" />
                      <text x={x + 6} y="165" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{session.date}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Weak Topics performance analysis */}
        <div className="glass-card" style={styles.panelCard}>
          <h3 style={styles.panelTitle}>Topics That Need Improvement</h3>
          {weakTopicsCount === 0 ? (
            <div style={styles.emptyAdvisory}>
              <CheckCircle2 size={24} color="var(--success)" style={{ marginBottom: '8px' }} />
              <h5 style={styles.emptyAdvisoryTitle}>0 Weak Topics</h5>
              <p style={styles.emptyAdvisoryText}>No performance data available yet.</p>
            </div>
          ) : (
            <div style={styles.weakList}>
              {weakTopicsList.map((item, index) => (
                <div key={index} style={styles.weakListItem}>
                  <div style={styles.weakTopicHeader}>
                    <span style={styles.weakTopicName}>{item.name}</span>
                    <span style={{ 
                      ...styles.weakTopicStatus, 
                      color: item.score < 50 ? 'var(--danger)' : 'var(--warning)',
                      backgroundColor: item.score < 50 ? 'var(--danger-bg)' : 'var(--warning-bg)'
                    }}>
                      {item.score < 50 ? 'Weak' : 'Needs Practice'}
                    </span>
                  </div>
                  <div style={styles.weakTopicScoreRow}>
                    <span style={styles.weakTopicScoreLabel}>Score:</span>
                    <strong style={styles.weakTopicScoreVal}>{item.score}%</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// Reusable Empty State component inside Dashboard.jsx
function EmptyState({ title, desc, actionLabel, onAction, icon: Icon }) {
  return (
    <div style={styles.emptyStateContainer}>
      <div style={styles.emptyIconBox}>
        {Icon ? <Icon size={24} color="var(--primary)" /> : <span>📊</span>}
      </div>
      <h4 style={styles.emptyTitle}>{title}</h4>
      <p style={styles.emptyDesc}>{desc}</p>
      {actionLabel && (
        <button onClick={onAction} style={styles.emptyActionBtn}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  progressCircle: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  progressValue: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  statContent: {
    marginTop: 'auto',
  },
  hugeText: {
    fontSize: '1.85rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
    fontFamily: "'Outfit', sans-serif",
  },
  statDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  middleRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '20px',
  },
  bigTimerCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2.5rem 2rem',
    minHeight: '300px',
  },
  widgetHeading: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },
  widgetDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    maxWidth: '420px',
    marginTop: '8px',
    lineHeight: '1.5',
  },
  liveTimerText: {
    fontSize: '3.5rem',
    fontWeight: '800',
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
    margin: '1.5rem 0',
    letterSpacing: '0.02em',
    textShadow: '0 0 20px rgba(var(--primary-rgb), 0.15)',
  },
  largeControls: {
    display: 'flex',
    gap: '12px',
  },
  largeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'transform 0.1s ease',
    cursor: 'pointer',
    border: 'none',
  },
  courseContinueCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2rem',
  },
  courseMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    color: 'var(--primary)',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  instructorTag: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  courseTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
    marginTop: '12px',
  },
  courseDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    lineHeight: '1.4',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1rem 0',
  },
  nextTopicBlock: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  nextLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nextTopicName: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    marginTop: '2px',
  },
  continueBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '16px',
    transition: 'all 0.2s ease',
    border: 'none',
  },

  /* Grid layouts for charts */
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '20px',
  },
  bottomTripleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  bottomDoubleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  panelCard: {
    minHeight: '280px',
    padding: '1.5rem',
  },
  panelTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  panelIcon: {
    marginRight: '8px',
  },

  /* Reusable Empty State container */
  emptyStateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem 1rem',
    height: '190px',
  },
  emptyIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  emptyDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    maxWidth: '300px',
    lineHeight: '1.45',
    marginBottom: '12px',
  },
  emptyActionBtn: {
    padding: '6px 14px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 0 10px rgba(var(--primary-rgb),0.15)',
  },

  /* Chart Styles */
  chartContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartSvg: {
    width: '100%',
    height: 'auto',
    maxHeight: '190px',
  },

  /* Donut Layout */
  donutContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '190px',
  },
  donutSvg: {
    maxHeight: '130px',
    width: 'auto',
  },
  donutLegend: {
    marginTop: '6px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  legendText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },

  /* Topic horizontal progress bars */
  topicMetersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '6px',
  },
  topicMeterRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  topicMeterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
  },
  topicMeterName: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  topicMeterPercent: {
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  topicMeterTrack: {
    height: '8px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  topicMeterFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },

  /* Recommendations */
  recItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  recNum: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgba(var(--primary-rgb), 0.08)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  recText: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },

  /* Weak Topics Empty State */
  emptyAdvisory: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem 1rem',
    height: '190px',
  },
  emptyAdvisoryTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '2px',
  },
  emptyAdvisoryText: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    maxWidth: '220px',
  },

  /* Weak topics active list */
  weakList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '190px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  weakListItem: {
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  weakTopicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weakTopicName: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  weakTopicStatus: {
    fontSize: '0.62rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  weakTopicScoreRow: {
    display: 'flex',
    gap: '6px',
    fontSize: '0.75rem',
    marginTop: '4px',
    color: 'var(--text-secondary)',
  },
  weakTopicScoreLabel: {
    fontWeight: '500',
  },
  weakTopicScoreVal: {
    color: 'var(--text-primary)',
  }
};
