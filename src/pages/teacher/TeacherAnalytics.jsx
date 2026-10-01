import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Award, 
  User, 
  BookOpen, 
  RefreshCw,
  ArrowUpDown,
  X,
  Eye,
  ArrowRight
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import courseService from '../../services/courseService';

export default function TeacherAnalytics({ teacher }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNeedsAttention, setFilterNeedsAttention] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const cList = await courseService.getAllCourses();
        setCourses(cList);
        await loadStudents();
      } catch (err) {
        console.error("Failed to load initial analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadStudents = async (courseId = '', search = '') => {
    try {
      setLoading(true);
      const data = await teacherService.getTeacherStudents(teacher.user_id, courseId, search);
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students roster:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterCourse = (e) => {
    const cid = e.target.value;
    setSelectedCourseId(cid);
    loadStudents(cid, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents(selectedCourseId, searchQuery);
  };

  // Filter students if needs attention is toggled
  const displayedStudents = students.filter(s => {
    if (filterNeedsAttention && !s.needsAttention) return false;
    return true;
  });

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Page Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageTitle}>Student Performance Analytics</h2>
          <p style={styles.pageSubtitle}>
            Comprehensive roster analytics aggregated from verified database quiz submissions, study timers, and assignment records.
          </p>
        </div>

        <button 
          onClick={() => loadStudents(selectedCourseId, searchQuery)} 
          style={styles.refreshBtn}
        >
          <RefreshCw size={14} /> Refresh Roster
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-card" style={styles.filterCard}>
        <form onSubmit={handleSearchSubmit} style={styles.searchBox}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Search student by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>

        <div style={styles.filterControls}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Course Filter:</span>
            <select 
              value={selectedCourseId}
              onChange={handleFilterCourse}
              style={styles.filterSelect}
            >
              <option value="">All My Courses</option>
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFilterNeedsAttention(!filterNeedsAttention)}
            style={{
              ...styles.toggleAttentionBtn,
              backgroundColor: filterNeedsAttention ? 'var(--danger-bg)' : 'var(--bg-secondary)',
              borderColor: filterNeedsAttention ? 'var(--danger-border)' : 'var(--border-color)',
              color: filterNeedsAttention ? 'var(--danger)' : 'var(--text-secondary)'
            }}
          >
            <AlertTriangle size={14} />
            <span>Students Needing Support Only</span>
            {filterNeedsAttention && <span style={styles.activeDot} />}
          </button>
        </div>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div style={styles.loadingBox}>
          <RefreshCw size={28} className="spin" color="var(--primary)" />
          <span>Aggregating relational performance metrics...</span>
        </div>
      ) : displayedStudents.length === 0 ? (
        <div className="glass-card" style={styles.emptyBox}>
          <User size={36} color="var(--text-muted)" />
          <h4>No Students Match Filter</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Try clearing the search query or course filter to display enrolled learners.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={styles.tableCard}>
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student Name & Email</th>
                  <th style={styles.th}>Enrolled Course</th>
                  <th style={styles.th}>Curriculum Progress</th>
                  <th style={styles.th}>Avg Quiz Score</th>
                  <th style={styles.th}>Assignments</th>
                  <th style={styles.th}>Study Time</th>
                  <th style={styles.th}>Weak Topics Identified</th>
                  <th style={styles.th}>Academic Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map(s => (
                  <tr key={`${s.studentId}-${s.courseId}`} style={styles.tr}>
                    
                    {/* Student Info */}
                    <td style={styles.td}>
                      <div style={styles.studentFlex}>
                        <img 
                          src={s.studentAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                          alt="" 
                          style={styles.avatar} 
                        />
                        <div>
                          <strong style={styles.studentName}>{s.studentName}</strong>
                          <span style={styles.studentEmail}>{s.studentEmail}</span>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td style={styles.td}>
                      <span style={styles.courseBadge}>{s.courseName}</span>
                    </td>

                    {/* Progress */}
                    <td style={styles.td}>
                      <div style={styles.progressCell}>
                        <div style={styles.progressTrack}>
                          <div style={{ ...styles.progressFill, width: `${s.progressPercentage}%` }} />
                        </div>
                        <span style={styles.progressPctText}>{s.completedTopics} of {s.totalTopics} ({s.progressPercentage}%)</span>
                      </div>
                    </td>

                    {/* Quiz Performance */}
                    <td style={styles.td}>
                      <div style={styles.quizCell}>
                        <strong style={{
                          color: s.avgQuizScore === '—' ? 'var(--text-muted)' : Number(s.avgQuizScore) >= 75 ? 'var(--success)' : Number(s.avgQuizScore) >= 50 ? 'var(--primary)' : 'var(--danger)'
                        }}>
                          {s.avgQuizScore !== '—' ? `${s.avgQuizScore}%` : '—'}
                        </strong>
                        <span style={styles.quizAttemptsText}>{s.quizAttemptsCount} quizzes taken</span>
                      </div>
                    </td>

                    {/* Assignments */}
                    <td style={styles.td}>
                      <div>
                        <strong>{s.avgAssignmentScore}</strong>
                        <span style={styles.subText}>{s.submittedAssignmentsCount} submitted</span>
                      </div>
                    </td>

                    {/* Study Time */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>{s.studyTimeString}</span>
                      </div>
                    </td>

                    {/* Weak Topics */}
                    <td style={styles.td}>
                      {s.weakTopics.length === 0 ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: '600' }}>✓ None</span>
                      ) : (
                        <div style={styles.weakChipsContainer}>
                          {s.weakTopics.map(w => (
                            <span key={w.topicId} style={styles.weakChip}>
                              {w.topicName} ({w.score}%)
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status / Attention Flag */}
                    <td style={styles.td}>
                      {s.needsAttention ? (
                        <div style={styles.attentionFlag}>
                          <AlertTriangle size={14} color="var(--danger)" />
                          <div>
                            <span style={styles.attentionTitle}>Needs Attention</span>
                            <span style={styles.attentionReason}>{s.attentionReasons[0] || 'Score < 50%'}</span>
                          </div>
                        </div>
                      ) : (
                        <span style={styles.onTrackBadge}>
                          <CheckCircle2 size={14} color="var(--success)" /> On Track
                        </span>
                      )}
                    </td>

                    {/* Action: Inspect */}
                    <td style={styles.td}>
                      <button
                        onClick={() => setSelectedStudentForDetails(s)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(var(--primary-rgb), 0.25)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Details Inspection Modal */}
      {selectedStudentForDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={selectedStudentForDetails.studentAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                  alt="" 
                  style={{ width: '44px', height: '44px', borderRadius: '10px' }} 
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {selectedStudentForDetails.studentName}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {selectedStudentForDetails.studentEmail} • {selectedStudentForDetails.courseName}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedStudentForDetails(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Course Progress</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--primary)' }}>
                    {selectedStudentForDetails.progressPercentage}%
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedStudentForDetails.completedTopics}/{selectedStudentForDetails.totalTopics} topics
                  </span>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Quiz Score</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: selectedStudentForDetails.avgQuizScore >= 75 ? 'var(--success)' : selectedStudentForDetails.avgQuizScore >= 50 ? 'var(--primary)' : 'var(--danger)' }}>
                    {selectedStudentForDetails.avgQuizScore}%
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedStudentForDetails.quizAttemptsCount} attempts
                  </span>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assignments</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {selectedStudentForDetails.avgAssignmentScore}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedStudentForDetails.submittedAssignmentsCount} submitted
                  </span>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Study Time</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {selectedStudentForDetails.studyTimeString}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Logged in timer
                  </span>
                </div>
              </div>

              {/* Attention Triggers if any */}
              {selectedStudentForDetails.needsAttention && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>
                    <AlertTriangle size={16} /> Automated Attention Triggers Identified
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {selectedStudentForDetails.attentionReasons.map((r, ri) => (
                      <li key={ri}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weak Topics */}
              <div>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Weak Topics (&lt; 50% score)</h4>
                {selectedStudentForDetails.weakTopics.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: '600' }}>✓ No weak topics identified for this student.</p>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedStudentForDetails.weakTopics.map(w => (
                      <span key={w.topicId} style={styles.weakChip}>
                        {w.topicName} — {w.score}%
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={() => setSelectedStudentForDetails(null)} 
                  style={styles.searchBtn}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '1.75rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  pageSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  filterCard: {
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '4px 10px',
    flexGrow: 1,
    maxWidth: '420px',
  },
  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '0.88rem',
    color: 'var(--text-primary)',
    padding: '6px 0',
  },
  searchBtn: {
    padding: '4px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  filterSelect: {
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  toggleAttentionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--danger)',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    gap: '12px',
    color: 'var(--text-muted)',
  },
  emptyBox: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textAlign: 'center',
  },
  tableCard: {
    padding: '1rem',
    overflow: 'hidden',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 14px',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border-color)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '12px 14px',
    fontSize: '0.85rem',
  },
  studentFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  studentName: {
    display: 'block',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
  },
  studentEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  courseBadge: {
    fontSize: '0.75rem',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  progressCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '110px',
  },
  progressTrack: {
    height: '6px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    borderRadius: '6px',
  },
  progressPctText: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  quizCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  quizAttemptsText: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  subText: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  weakChipsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  weakChip: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--danger)',
    backgroundColor: 'var(--danger-bg)',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },
  attentionFlag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
  },
  attentionTitle: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--danger)',
  },
  attentionReason: {
    fontSize: '0.7rem',
    color: 'var(--danger)',
  },
  onTrackBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--success)',
  },
};
