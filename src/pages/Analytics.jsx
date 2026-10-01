import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  RefreshCw, 
  Sparkles, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Check,
  Award,
  Zap,
  RotateCcw
} from 'lucide-react';
import timelineService from '../services/timelineService';
import analyticsService from '../services/analyticsService';

export default function Analytics({ student, course, analytics, currentUser, setActivePage, setSelectedTopicId }) {
  const [activeTab, setActiveTab] = useState('mastery'); // 'mastery' | 'revision' | 'timeline'
  const [masteryData, setMasteryData] = useState([]);
  const [revisionQueue, setRevisionQueue] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const studentId = currentUser?.user_id || 1;
  const courseId = course?.id || 'py-101';

  // Load backend data for Topic Mastery Map, Revision Queue, and Learning Timeline
  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [masteryRes, revisionRes, timelineRes] = await Promise.allSettled([
        timelineService.getTopicMastery(studentId, courseId),
        timelineService.getRevisionQueue(studentId),
        timelineService.getTimeline(studentId, courseId)
      ]);

      if (masteryRes.status === 'fulfilled' && Array.isArray(masteryRes.value)) {
        setMasteryData(masteryRes.value);
      } else {
        // Fallback calculation from course topics and student state
        const fallbackMastery = (course?.topics || []).map((t, idx) => {
          const isComp = student?.completedTopics?.includes(t.id);
          return {
            topicId: t.id,
            topicName: t.name,
            category: t.category || "General",
            order: idx + 1,
            completionPercentage: isComp ? 100 : 0,
            avgQuizScore: isComp ? 85 : null,
            quizAttempts: isComp ? 1 : 0,
            studyTimeSeconds: isComp ? 1800 : 0,
            studyTimeString: isComp ? "30m" : "0m",
            status: isComp ? "Completed" : "Not Started",
            recommendedAction: isComp ? "Mastery achieved! Review advanced examples." : "Begin studying topic syntax and reference guide."
          };
        });
        setMasteryData(fallbackMastery);
      }

      if (revisionRes.status === 'fulfilled' && Array.isArray(revisionRes.value)) {
        setRevisionQueue(revisionRes.value);
      } else {
        setRevisionQueue([]);
      }

      if (timelineRes.status === 'fulfilled' && Array.isArray(timelineRes.value)) {
        setTimelineEvents(timelineRes.value);
      } else {
        // Fallback events
        setTimelineEvents([
          {
            id: 1,
            event_type: 'topic_completed',
            event_title: 'Completed Topic: Variables & Types',
            event_description: 'Successfully mastered fundamental Python data structures.',
            course_name: 'Python Programming',
            created_at: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: 2,
            event_type: 'quiz_submitted',
            event_title: 'Attempted Quiz: Control Flow',
            event_description: 'Achieved 80% passing grade.',
            course_name: 'Python Programming',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [studentId, courseId]);

  const handleResolveRevision = async (item) => {
    try {
      await timelineService.markRevisionCompleted(studentId, item.topicId, item.courseId);
      setRevisionQueue(prev => prev.filter(r => r.id !== item.id));
      setActionSuccess(`Revision for "${item.topicName}" marked completed!`);
      setTimeout(() => setActionSuccess(''), 4000);
      loadAnalyticsData();
    } catch (err) {
      console.error("Error resolving revision:", err);
    }
  };

  const navigateToTopic = (topicId) => {
    if (setSelectedTopicId && setActivePage) {
      setSelectedTopicId(topicId);
      setActivePage('courses');
    }
  };

  // Calculations
  const completedTopicsCount = masteryData.filter(m => m.status === 'Completed').length;
  const needsRevisionCount = masteryData.filter(m => m.status === 'Needs Revision').length;
  const inProgressCount = masteryData.filter(m => m.status === 'In Progress').length;
  const totalTopics = masteryData.length || 1;
  const masteryPercentage = Math.round((completedTopicsCount / totalTopics) * 100);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#10b981', label: 'Mastered' };
      case 'Needs Revision':
        return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', label: 'Needs Revision' };
      case 'In Progress':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', label: 'In Progress' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.25)', color: '#94a3b8', label: 'Not Started' };
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Top Banner & Title */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Analytics & Academic Advisor</h2>
          <p style={styles.pageSubtitle}>
            Continuous diagnostic tracking, mastery maps, and personalized study recommendations
          </p>
        </div>

        <button 
          onClick={loadAnalyticsData} 
          style={styles.refreshBtn}
          title="Refresh analytics data"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccess && (
        <div style={styles.alertSuccess}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Mastery Level</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{masteryPercentage}%</div>
          <div style={styles.kpiSub}>
            {completedTopicsCount} of {totalTopics} topics mastered
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Revision Queue</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{revisionQueue.length}</div>
          <div style={styles.kpiSub}>
            {revisionQueue.length === 0 ? "Queue is clear! Great job." : "Items requiring your attention"}
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>In Progress Topics</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Zap size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{inProgressCount}</div>
          <div style={styles.kpiSub}>
            Modules actively being studied
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Timeline Events</span>
            <div style={{ ...styles.kpiIcon, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={styles.kpiValue}>{timelineEvents.length}</div>
          <div style={styles.kpiSub}>
            Logged academic milestones
          </div>
        </div>
      </div>

      {/* Advisor Insight Callout */}
      <div style={styles.advisorCallout}>
        <div style={styles.advisorHeader}>
          <div style={styles.advisorIcon}>
            <Sparkles size={20} color="#0284c7" />
          </div>
          <div>
            <h4 style={styles.advisorTitle}>Rule-Based Diagnostic Advisory</h4>
            <p style={styles.advisorText}>
              {needsRevisionCount > 0 ? (
                `You have ${needsRevisionCount} module(s) scoring below the 50% mastery threshold. Prioritize reviewing the topics in your Smart Revision Queue before progressing to advanced modules.`
              ) : revisionQueue.length > 0 ? (
                `You have ${revisionQueue.length} pending task(s) in your queue. Complete your assignments or retake practice tests to ensure durable retention.`
              ) : (
                `Outstanding academic progress! Your syllabus completion is on track and all attempted modules meet or exceed the mastery threshold.`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab('mastery')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'mastery' ? styles.tabBtnActive : {}) }}
        >
          <Award size={18} />
          <span>Topic Mastery Map</span>
          <span style={styles.tabCount}>{masteryData.length}</span>
        </button>

        <button 
          onClick={() => setActiveTab('revision')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'revision' ? styles.tabBtnActive : {}) }}
        >
          <RotateCcw size={18} />
          <span>Smart Revision Queue</span>
          {revisionQueue.length > 0 && (
            <span style={{ ...styles.tabCount, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              {revisionQueue.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('timeline')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'timeline' ? styles.tabBtnActive : {}) }}
        >
          <Calendar size={18} />
          <span>Learning Timeline</span>
          <span style={styles.tabCount}>{timelineEvents.length}</span>
        </button>
      </div>

      {/* TAB 1: TOPIC MASTERY MAP */}
      {activeTab === 'mastery' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>Interactive Topic Mastery Roadmap</h3>
              <p style={styles.sectionDesc}>
                Click any topic node to view comprehensive diagnostics, quiz performance, and targeted recommendations.
              </p>
            </div>
            
            {/* Legend */}
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#10b981' }} />
                <span>Mastered (≥80%)</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#f59e0b' }} />
                <span>In Progress (50-79%)</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#ef4444' }} />
                <span>Needs Revision (&lt;50%)</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#94a3b8' }} />
                <span>Not Started</span>
              </div>
            </div>
          </div>

          <div style={styles.masteryGrid}>
            {masteryData.map((item, idx) => {
              const badge = getStatusBadge(item.status);
              const isSelected = selectedTopic?.topicId === item.topicId;

              return (
                <div 
                  key={item.topicId}
                  onClick={() => setSelectedTopic(item)}
                  style={{
                    ...styles.masteryCard,
                    borderColor: isSelected ? 'var(--primary)' : badge.border,
                    boxShadow: isSelected ? '0 0 0 2px rgba(14, 165, 233, 0.25)' : 'none'
                  }}
                >
                  <div style={styles.cardTop}>
                    <span style={styles.orderBadge}>#{item.order || idx + 1}</span>
                    <span style={{
                      ...styles.statusPill,
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                      color: badge.color
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  <h4 style={styles.topicName}>{item.topicName}</h4>
                  <span style={styles.categoryLabel}>{item.category}</span>

                  <div style={styles.progressContainer}>
                    <div style={styles.progressBarBg}>
                      <div 
                        style={{
                          ...styles.progressBarFill,
                          width: `${item.completionPercentage}%`,
                          backgroundColor: badge.color
                        }}
                      />
                    </div>
                    <span style={styles.progressText}>{item.completionPercentage}%</span>
                  </div>

                  <div style={styles.metricRow}>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Quiz Score</span>
                      <span style={styles.metricVal}>
                        {item.avgQuizScore !== null ? `${item.avgQuizScore}%` : 'N/A'}
                      </span>
                    </div>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Study Time</span>
                      <span style={styles.metricVal}>{item.studyTimeString || '0m'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToTopic(item.topicId);
                    }}
                    style={styles.openTopicBtn}
                  >
                    <span>Study Module</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Topic Diagnostic Drawer */}
          {selectedTopic && (
            <div style={styles.topicDrawer}>
              <div style={styles.drawerHeader}>
                <div>
                  <span style={styles.drawerCategory}>{selectedTopic.category}</span>
                  <h3 style={styles.drawerTitle}>{selectedTopic.topicName}</h3>
                </div>
                <button onClick={() => setSelectedTopic(null)} style={styles.closeBtn}>×</button>
              </div>

              <div style={styles.drawerBody}>
                <div style={styles.drawerGrid}>
                  <div style={styles.drawerStatBox}>
                    <span style={styles.drawerStatLabel}>Status</span>
                    <span style={{
                      ...styles.statusPill,
                      ...getStatusBadge(selectedTopic.status),
                      marginTop: '6px'
                    }}>
                      {selectedTopic.status}
                    </span>
                  </div>
                  <div style={styles.drawerStatBox}>
                    <span style={styles.drawerStatLabel}>Completion Rate</span>
                    <span style={styles.drawerStatVal}>{selectedTopic.completionPercentage}%</span>
                  </div>
                  <div style={styles.drawerStatBox}>
                    <span style={styles.drawerStatLabel}>Quiz Average</span>
                    <span style={styles.drawerStatVal}>
                      {selectedTopic.avgQuizScore !== null ? `${selectedTopic.avgQuizScore}%` : 'No attempts'}
                    </span>
                  </div>
                  <div style={styles.drawerStatBox}>
                    <span style={styles.drawerStatLabel}>Time Spent</span>
                    <span style={styles.drawerStatVal}>{selectedTopic.studyTimeString || '0m'}</span>
                  </div>
                </div>

                <div style={styles.recommendationCard}>
                  <div style={styles.recHeader}>
                    <Sparkles size={16} color="#0ea5e9" />
                    <span style={styles.recTitle}>Advisor Recommendation</span>
                  </div>
                  <p style={styles.recText}>{selectedTopic.recommendedAction}</p>
                </div>

                <div style={styles.drawerActions}>
                  <button 
                    onClick={() => navigateToTopic(selectedTopic.topicId)}
                    style={styles.primaryActionBtn}
                  >
                    <span>Open Topic Material</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SMART REVISION QUEUE */}
      {activeTab === 'revision' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>Smart Revision Queue</h3>
              <p style={styles.sectionDesc}>
                Rule-based automated prioritization of modules with low quiz scores, missed deadlines, or lapsed recall.
              </p>
            </div>
          </div>

          {revisionQueue.length === 0 ? (
            <div style={styles.emptyState}>
              <ShieldCheck size={48} color="#10b981" />
              <h4 style={styles.emptyTitle}>Your Revision Queue is Clear!</h4>
              <p style={styles.emptyDesc}>
                You have no struggling topics or overdue assessments. Keep up the high level of mastery!
              </p>
            </div>
          ) : (
            <div style={styles.revisionList}>
              {revisionQueue.map((item) => (
                <div key={item.id} style={styles.revisionItem}>
                  <div style={styles.revisionLeft}>
                    <div style={{
                      ...styles.revIconBox,
                      backgroundColor: item.category?.includes('Quiz') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: item.category?.includes('Quiz') ? '#ef4444' : '#f59e0b'
                    }}>
                      {item.category?.includes('Quiz') ? <AlertTriangle size={20} /> : <BookOpen size={20} />}
                    </div>

                    <div style={styles.revInfo}>
                      <div style={styles.revTagRow}>
                        <span style={styles.revCategoryBadge}>{item.category}</span>
                        <span style={styles.revCourseBadge}>{item.courseName}</span>
                      </div>
                      <h4 style={styles.revTopicTitle}>{item.topicName}</h4>
                      <p style={styles.revReason}>{item.reason}</p>
                      <div style={styles.revSuggestionRow}>
                        <Sparkles size={14} color="#0ea5e9" />
                        <span style={styles.revSuggestionText}>{item.suggestedAction}</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.revActions}>
                    <button 
                      onClick={() => navigateToTopic(item.topicId)}
                      style={styles.revReviewBtn}
                    >
                      <span>Review Now</span>
                      <ChevronRight size={14} />
                    </button>

                    <button 
                      onClick={() => handleResolveRevision(item)}
                      style={styles.revDoneBtn}
                      title="Mark as Revised"
                    >
                      <Check size={16} />
                      <span>Mark Done</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEARNING TIMELINE */}
      {activeTab === 'timeline' && (
        <div style={styles.tabContent}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionTitle}>Chronological Learning Timeline</h3>
              <p style={styles.sectionDesc}>
                Audit trail of completed topics, quiz submissions, study hours, and academic milestones.
              </p>
            </div>
          </div>

          {timelineEvents.length === 0 ? (
            <div style={styles.emptyState}>
              <Clock size={48} color="var(--text-muted)" />
              <h4 style={styles.emptyTitle}>No Timeline Events Recorded Yet</h4>
              <p style={styles.emptyDesc}>
                Start studying topics or attempt a quiz to record your academic milestones.
              </p>
            </div>
          ) : (
            <div style={styles.timelineList}>
              {timelineEvents.map((evt, idx) => {
                const dateStr = new Date(evt.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={evt.id || idx} style={styles.timelineCard}>
                    <div style={styles.timelineTrack}>
                      <div style={styles.timelineDot} />
                      {idx < timelineEvents.length - 1 && <div style={styles.timelineLine} />}
                    </div>

                    <div style={styles.timelineContent}>
                      <div style={styles.timelineHeader}>
                        <div style={styles.timelineTypeRow}>
                          <span style={styles.timelineTypeBadge}>
                            {evt.event_type?.replace(/_/g, ' ').toUpperCase() || 'ACTIVITY'}
                          </span>
                          <span style={styles.timelineCourseBadge}>
                            {evt.course_name || 'Course Milestone'}
                          </span>
                        </div>
                        <span style={styles.timelineTime}>{dateStr}</span>
                      </div>

                      <h4 style={styles.timelineTitle}>{evt.event_title}</h4>
                      {evt.event_description && (
                        <p style={styles.timelineDesc}>{evt.event_description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },
  pageSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontWeight: '500',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  kpiIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '1.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },
  kpiSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  advisorCallout: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    border: '1px solid rgba(14, 165, 233, 0.22)',
    borderRadius: '14px',
    padding: '18px 22px',
  },
  advisorHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
  },
  advisorIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  advisorTitle: {
    fontSize: '0.98rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  advisorText: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginTop: '6px',
    margin: 0,
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '2px',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px 10px 0 0',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: 'var(--primary)',
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    borderBottomColor: 'var(--bg-secondary)',
    fontWeight: '600',
  },
  tabCount: {
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  sectionDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    margin: 0,
  },
  legend: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  masteryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  masteryCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderBadge: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  statusPill: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '12px',
    border: '1px solid',
  },
  topicName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.3,
  },
  categoryLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
  },
  progressBarBg: {
    flexGrow: 1,
    height: '6px',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-primary)',
    padding: '8px 12px',
    borderRadius: '8px',
    marginTop: '4px',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  metricVal: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  openTopicBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '4px',
  },
  topicDrawer: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '22px',
    marginTop: '10px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '14px',
  },
  drawerCategory: {
    fontSize: '0.8rem',
    color: 'var(--primary)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  drawerTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '4px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  drawerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  drawerStatBox: {
    backgroundColor: 'var(--bg-primary)',
    padding: '12px 16px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  drawerStatLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  drawerStatVal: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  recommendationCard: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    border: '1px solid rgba(14, 165, 233, 0.25)',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  recHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  recTitle: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  recText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    margin: 0,
  },
  drawerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  primaryActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.88rem',
    border: 'none',
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
    gap: '12px',
  },
  emptyTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  emptyDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    maxWidth: '460px',
    margin: 0,
    lineHeight: 1.4,
  },
  revisionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  revisionItem: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  revisionLeft: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    flexGrow: 1,
    minWidth: '280px',
  },
  revIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  revInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  revTagRow: {
    display: 'flex',
    gap: '8px',
  },
  revCategoryBadge: {
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#ef4444',
  },
  revCourseBadge: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  revTopicTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '2px 0',
  },
  revReason: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  revSuggestionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  revSuggestionText: {
    fontSize: '0.8rem',
    color: '#0ea5e9',
    fontWeight: '500',
  },
  revActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  revReviewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: '500',
    fontSize: '0.85rem',
    border: 'none',
    cursor: 'pointer',
  },
  revDoneBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  timelineCard: {
    display: 'flex',
    gap: '16px',
    position: 'relative',
    paddingBottom: '24px',
  },
  timelineTrack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '24px',
    flexShrink: 0,
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 0 4px rgba(14, 165, 233, 0.2)',
    marginTop: '6px',
  },
  timelineLine: {
    width: '2px',
    flexGrow: 1,
    backgroundColor: 'var(--border-color)',
    marginTop: '6px',
  },
  timelineContent: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px 20px',
    flexGrow: 1,
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '6px',
  },
  timelineTypeRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  timelineTypeBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    color: '#0ea5e9',
    letterSpacing: '0.04em',
  },
  timelineCourseBadge: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  timelineTime: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  timelineTitle: {
    fontSize: '0.98rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  timelineDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    margin: 0,
    lineHeight: 1.4,
  },
};
