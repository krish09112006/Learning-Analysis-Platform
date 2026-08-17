import React from 'react';
import { Play, Pause, Square, BookOpen, AlertTriangle, CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react';

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
  
  // Format seconds to readable Hrs & Mins
  const formatTotalTime = (seconds) => {
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs} Hours`;
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

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Upper Grid: Analytics Summary */}
      <div style={styles.statsGrid}>
        
        {/* Progress Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Overall Progress</span>
            <BookOpen size={18} color="#6366f1" />
          </div>
          <div style={styles.progressContainer}>
            <div style={styles.progressCircle}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  fill="none" 
                  stroke="url(#gradient-primary)" 
                  strokeWidth="6" 
                  strokeDasharray="213.6" 
                  strokeDashoffset={213.6 - (213.6 * analytics.progressPercent) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <defs>
                  <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={styles.progressText}>{analytics.progressPercent}%</span>
            </div>
            <div>
              <h4 style={styles.progressValue}>{student.completedTopics.length} / {course.topics.length}</h4>
              <span style={styles.progressLabel}>Topics Completed</span>
            </div>
          </div>
        </div>

        {/* Study Hours Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Study Duration</span>
            <Clock size={18} color="#8b5cf6" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.hugeText}>{formatTotalTime(student.totalStudySeconds)}</h3>
            <p style={styles.statDesc}>Total time active on workspace</p>
          </div>
        </div>

        {/* Quiz Averages Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Quiz Performance</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <h3 style={{...styles.hugeText, color: analytics.avgQuizScore >= 75 ? '#10b981' : '#f59e0b'}}>
              {analytics.avgQuizScore}%
            </h3>
            <p style={styles.statDesc}>Across {analytics.totalQuizzesAttempted} attempted modules</p>
          </div>
        </div>

        {/* Weak Topics Alert Card */}
        <div className="glass-card" style={{
          ...styles.statCard, 
          borderLeft: analytics.weakTopics.length > 0 ? '3px solid #f43f5e' : '1px solid rgba(99, 102, 241, 0.12)'
        }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Weak Topics Alert</span>
            <AlertTriangle size={18} color={analytics.weakTopics.length > 0 ? '#f43f5e' : '#10b981'} />
          </div>
          <div style={styles.statContent}>
            <h3 style={{
              ...styles.hugeText, 
              color: analytics.weakTopics.length > 0 ? '#f43f5e' : '#10b981'
            }}>
              {analytics.weakTopics.length}
            </h3>
            <p style={styles.statDesc}>
              {analytics.weakTopics.length > 0 
                ? "Topics scoring below 60% standard threshold" 
                : "All tested topics meet target thresholds!"}
            </p>
          </div>
        </div>

      </div>

      {/* Middle Row: Active Study timer widget & Continue Learning */}
      <div style={styles.middleRow}>
        
        {/* Large Interactive Study Widget */}
        <div className="glass-card glow-card" style={styles.bigTimerCard}>
          <h3 style={styles.widgetHeading}>Interactive Study Tracker</h3>
          <p style={styles.widgetDesc}>Focus on your syllabus. Click start to track active learning seconds. Studies show regular sessions boost retention.</p>
          
          <div style={styles.liveTimerText}>
            {formatTimer(studyTimer.seconds)}
          </div>

          <div style={styles.largeControls}>
            {!studyTimer.isActive ? (
              <button onClick={startTimer} style={{...styles.largeBtn, backgroundColor: '#10b981'}}>
                <Play size={18} fill="#fff" /> Start Session
              </button>
            ) : (
              <>
                {studyTimer.isPaused ? (
                  <button onClick={startTimer} style={{...styles.largeBtn, backgroundColor: '#6366f1'}}>
                    <Play size={18} fill="#fff" /> Resume
                  </button>
                ) : (
                  <button onClick={pauseTimer} style={{...styles.largeBtn, backgroundColor: '#f59e0b'}}>
                    <Pause size={18} fill="#fff" /> Pause
                  </button>
                )}
                <button onClick={stopTimer} style={{...styles.largeBtn, backgroundColor: '#f43f5e'}}>
                  <Square size={16} fill="#fff" /> Stop & Save
                </button>
              </>
            )}
          </div>
        </div>

        {/* Continue Learning Course Card */}
        <div className="glass-card" style={styles.courseContinueCard}>
          <div style={styles.courseMeta}>
            <span style={styles.courseTag}>Active Course</span>
            <span style={styles.instructorTag}>{course.instructor}</span>
          </div>
          <h3 style={styles.courseTitle}>{course.title}</h3>
          <p style={styles.courseDesc}>{course.description}</p>
          
          <div style={styles.divider} />
          
          <div style={styles.nextTopicBlock}>
            <span style={styles.nextLabel}>Up Next:</span>
            {currentLearningTopic ? (
              <h4 style={styles.nextTopicName}>Module {currentLearningTopic.id}: {currentLearningTopic.name}</h4>
            ) : (
              <h4 style={styles.nextTopicName}>No Modules Added Yet</h4>
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

      </div>

      {/* Bottom Grid: Deadlines and Alerts */}
      <div style={styles.bottomGrid}>
        
        {/* Upcoming Deadlines Checklist */}
        <div className="glass-card" style={styles.panelCard}>
          <h3 style={styles.panelTitle}>
            <Calendar size={18} style={styles.panelIcon} /> Upcoming Deadlines
          </h3>
          <div style={styles.deadlineList}>
            {course.topics.map(t => {
              const isSubmitted = student.assignmentSubmissions.some(s => s.assignmentId === t.assignment.id);
              if (isSubmitted) return null;
              return (
                <div key={t.id} style={styles.deadlineItem}>
                  <div style={styles.deadlineDot} />
                  <div style={{flexGrow: 1}}>
                    <h5 style={styles.deadlineName}>{t.assignment.title}</h5>
                    <span style={styles.deadlineTopic}>Module: {t.name}</span>
                  </div>
                  <span style={styles.dueDateBadge}>Due {t.assignment.dueDate}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Topic Rule Actions */}
        <div className="glass-card" style={styles.panelCard}>
          <h3 style={styles.panelTitle}>
            <AlertTriangle size={18} style={styles.panelIcon} /> Actionable Alerts
          </h3>
          <div style={styles.alertList}>
            {analytics.weakTopics.length === 0 ? (
              <div style={styles.emptyAlert}>
                <CheckCircle2 size={32} color="#10b981" style={{marginBottom: '8px'}} />
                <p>Excellent standing! No weak topics detected at this time.</p>
              </div>
            ) : (
              analytics.weakTopics.map(w => (
                <div key={w.topicId} style={styles.weakTopicAlert}>
                  <div style={styles.weakHeader}>
                    <h5 style={styles.weakName}>{w.name}</h5>
                    <span style={styles.scoreBadge}>Score: {w.score}%</span>
                  </div>
                  <ul style={styles.recList}>
                    {w.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx} style={styles.recListItem}>{rec}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

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
    color: '#6b7280',
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
    color: '#f3f4f6',
  },
  progressValue: {
    fontSize: '1.25rem',
    color: '#f3f4f6',
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  statContent: {
    marginTop: 'auto',
  },
  hugeText: {
    fontSize: '1.85rem',
    fontWeight: '800',
    color: '#f3f4f6',
    lineHeight: '1.1',
    fontFamily: "'Outfit', sans-serif",
  },
  statDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
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
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
  },
  widgetDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    maxWidth: '420px',
    marginTop: '8px',
    lineHeight: '1.5',
  },
  liveTimerText: {
    fontSize: '3.5rem',
    fontWeight: '800',
    fontFamily: 'monospace',
    color: '#f3f4f6',
    margin: '1.5rem 0',
    letterSpacing: '0.02em',
    textShadow: '0 0 20px rgba(99, 102, 241, 0.25)',
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  instructorTag: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  courseTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
    marginTop: '12px',
  },
  courseDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '6px',
    lineHeight: '1.4',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: '1rem 0',
  },
  nextTopicBlock: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  nextLabel: {
    fontSize: '0.65rem',
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nextTopicName: {
    fontSize: '0.85rem',
    color: '#d1d5db',
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
    backgroundColor: '#8b5cf6',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '16px',
    transition: 'all 0.2s ease',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  panelCard: {
    minHeight: '280px',
  },
  panelTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  panelIcon: {
    marginRight: '8px',
  },
  deadlineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  deadlineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  deadlineDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#f59e0b',
    borderRadius: '50%',
  },
  deadlineName: {
    fontSize: '0.85rem',
    color: '#e5e7eb',
    fontWeight: '600',
  },
  deadlineTopic: {
    fontSize: '0.75rem',
    color: '#6b7280',
    display: 'block',
  },
  dueDateBadge: {
    fontSize: '0.7rem',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '2px 8px',
    borderRadius: '8px',
    fontWeight: '600',
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyAlert: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.8rem',
    height: '160px',
  },
  weakTopicAlert: {
    backgroundColor: 'rgba(244, 63, 94, 0.03)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  weakHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  weakName: {
    fontSize: '0.85rem',
    color: '#f3f4f6',
    fontWeight: '600',
  },
  scoreBadge: {
    fontSize: '0.7rem',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    color: '#f43f5e',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  recList: {
    paddingLeft: '16px',
    margin: 0,
  },
  recListItem: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '4px',
    lineHeight: '1.3',
  },
};
