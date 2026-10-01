import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  MessageSquare, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  X,
  User
} from 'lucide-react';
import teacherService from '../../services/teacherService';

export default function TeacherInterventions({ teacher }) {
  const [data, setData] = useState({ interventions: [], automatedFlags: [] });
  const [loading, setLoading] = useState(true);
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [assignRevision, setAssignRevision] = useState(true);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const res = await teacherService.getInterventions(teacher.user_id);
      setData(res);
    } catch (err) {
      console.error("Failed to load interventions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  // Open Action Modal
  const handleOpenActionModal = (item) => {
    setSelectedItemForAction(item);
    setActionNotes(item.teacher_notes || '');
  };

  // Submit Intervention Action (Assign revision / add note / resolve)
  const handleSubmitAction = async (status = 'In Progress') => {
    if (!selectedItemForAction) return;

    try {
      if (selectedItemForAction.id) {
        // Update existing intervention
        await teacherService.updateIntervention(
          selectedItemForAction.id,
          status,
          actionNotes
        );
      } else {
        // Create new intervention record from automated flag
        await teacherService.createIntervention({
          teacher_id: teacher.user_id,
          student_id: selectedItemForAction.studentId,
          course_id: selectedItemForAction.courseId,
          topic_id: selectedItemForAction.topicId,
          reason: selectedItemForAction.reason,
          trigger_metric: selectedItemForAction.triggerMetric,
          recommended_action: selectedItemForAction.recommendedAction,
          teacher_notes: actionNotes,
          status: status
        });
      }

      setSelectedItemForAction(null);
      setActionNotes('');
      fetchInterventions();
    } catch (err) {
      alert("Failed to submit intervention: " + err.message);
    }
  };

  // Resolve Intervention directly
  const handleResolve = async (interventionId) => {
    try {
      await teacherService.updateIntervention(interventionId, 'Resolved', 'Resolved by instructor review.');
      fetchInterventions();
    } catch (err) {
      alert("Failed to resolve intervention: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Top Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageTitle}>Teacher Intervention Panel</h2>
          <p style={styles.pageSubtitle}>
            Transparent, rule-based academic support system identifying students who need timely guidance.
          </p>
        </div>

        <button onClick={fetchInterventions} style={styles.refreshBtn}>
          <RefreshCw size={14} /> Re-evaluate Rules
        </button>
      </div>

      {/* Transparent Rules Explainer Banner */}
      <div className="glass-card" style={styles.rulesBanner}>
        <div style={styles.rulesHeader}>
          <ShieldAlert size={18} color="var(--primary)" />
          <h4 style={styles.rulesTitle}>Transparent Academic Evaluation Rules</h4>
        </div>
        <div style={styles.rulesGrid}>
          <div style={styles.ruleItem}>
            <span style={styles.ruleBullet}>•</span>
            <span>Average topic quiz score &lt; 50%</span>
          </div>
          <div style={styles.ruleItem}>
            <span style={styles.ruleBullet}>•</span>
            <span>Zero learning activity for 7+ consecutive days</span>
          </div>
          <div style={styles.ruleItem}>
            <span style={styles.ruleBullet}>•</span>
            <span>Missed assignment submission deadlines</span>
          </div>
          <div style={styles.ruleItem}>
            <span style={styles.ruleBullet}>•</span>
            <span>Curriculum progress &lt; 25% after two weeks</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Automated Rule-Based Alerts */}
      <div>
        <h3 style={styles.sectionHeading}>
          Active Academic Risk Flags ({data.automatedFlags?.length || 0})
        </h3>
        <p style={styles.sectionSub}>Students triggered by deterministic threshold rules needing attention.</p>

        {loading ? (
          <div style={styles.loadingBox}>
            <RefreshCw size={24} className="spin" color="var(--primary)" />
            <span>Scanning performance metrics...</span>
          </div>
        ) : !data.automatedFlags || data.automatedFlags.length === 0 ? (
          <div className="glass-card" style={styles.emptyCard}>
            <CheckCircle2 size={36} color="var(--success)" />
            <h4>All Students On Track</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No students currently violate the risk thresholds. All learners are maintaining healthy progress!
            </p>
          </div>
        ) : (
          <div style={styles.flagsGrid}>
            {data.automatedFlags.map((flag, idx) => (
              <div key={idx} className="glass-card" style={styles.flagCard}>
                <div style={styles.flagTop}>
                  <div style={styles.studentFlex}>
                    <img 
                      src={flag.studentAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                      alt="" 
                      style={styles.avatar} 
                    />
                    <div>
                      <strong style={styles.studentName}>{flag.studentName}</strong>
                      <span style={styles.courseName}>{flag.courseName}</span>
                    </div>
                  </div>
                  <span style={styles.triggerBadge}>
                    <AlertTriangle size={12} /> {flag.reason}
                  </span>
                </div>

                <div style={styles.metricBox}>
                  <span style={styles.metricLabel}>Metric Trigger:</span>
                  <p style={styles.metricValue}>{flag.triggerMetric}</p>
                </div>

                <div style={styles.actionBox}>
                  <span style={styles.actionLabel}>Recommended Teacher Action:</span>
                  <p style={styles.actionValue}>{flag.recommendedAction}</p>
                </div>

                <div style={styles.flagFooter}>
                  <span style={styles.topicText}>Related: {flag.topicName}</span>
                  <button 
                    onClick={() => handleOpenActionModal(flag)} 
                    style={styles.interveneBtn}
                  >
                    Take Action <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Saved / Historical Interventions */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={styles.sectionHeading}>
          Intervention History & Tracked Actions ({data.interventions?.length || 0})
        </h3>

        {!data.interventions || data.interventions.length === 0 ? (
          <div className="glass-card" style={styles.emptyCard}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No intervention records stored yet.</p>
          </div>
        ) : (
          <div style={styles.interventionsTableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Course & Topic</th>
                  <th style={styles.th}>Trigger Reason</th>
                  <th style={styles.th}>Teacher Action & Notes</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.interventions.map(intv => (
                  <tr key={intv.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.studentFlex}>
                        <img src={intv.student_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} alt="" style={styles.avatar} />
                        <div>
                          <strong>{intv.student_name}</strong>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{intv.student_email}</span>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div>
                        <span style={styles.courseBadge}>{intv.course_name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{intv.topic_name || 'General'}</span>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--danger)' }}>
                        {intv.reason}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {intv.trigger_metric}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {intv.teacher_notes || intv.recommended_action}
                      </p>
                    </td>

                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: intv.status === 'Resolved' ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: intv.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {intv.status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {intv.status !== 'Resolved' ? (
                        <button 
                          onClick={() => handleResolve(intv.id)}
                          style={styles.resolveBtn}
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL: TAKE INTERVENTION ACTION --- */}
      {selectedItemForAction && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                Academic Intervention: {selectedItemForAction.studentName || selectedItemForAction.student_name}
              </h3>
              <button onClick={() => setSelectedItemForAction(null)} style={styles.closeBtn}><X size={18} /></button>
            </div>

            <div style={styles.actionModalBody}>
              <div style={styles.modalAlertBox}>
                <strong>Trigger: {selectedItemForAction.reason}</strong>
                <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>{selectedItemForAction.triggerMetric || selectedItemForAction.trigger_metric}</p>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Teacher Feedback & Advisor Instructions *</label>
                <textarea 
                  rows={4}
                  placeholder="Enter personalized guidance, assignment adjustments, or office hours advice to send to this student..."
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  style={styles.textareaField}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                <input 
                  type="checkbox"
                  id="assignRev"
                  checked={assignRevision}
                  onChange={e => setAssignRevision(e.target.checked)}
                />
                <label htmlFor="assignRev" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Notify student in their notification center with these instructions
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setSelectedItemForAction(null)} 
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSubmitAction('In Progress')} 
                  style={styles.submitActionBtn}
                >
                  <Send size={14} /> Dispatch Guidance
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
  rulesBanner: {
    padding: '1.25rem',
    backgroundColor: 'rgba(var(--primary-rgb), 0.05)',
    border: '1px solid rgba(var(--primary-rgb), 0.18)',
  },
  rulesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  rulesTitle: {
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '10px',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  ruleBullet: {
    color: 'var(--primary)',
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    gap: '10px',
    color: 'var(--text-muted)',
  },
  emptyCard: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textAlign: 'center',
  },
  flagsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '16px',
  },
  flagCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderLeft: '3px solid var(--danger)',
  },
  flagTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  studentFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  studentName: {
    display: 'block',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  courseName: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  triggerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--danger)',
    backgroundColor: 'var(--danger-bg)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  metricBox: {
    backgroundColor: 'var(--bg-primary)',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
  },
  metricLabel: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  metricValue: {
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  actionBox: {
    backgroundColor: 'rgba(var(--primary-rgb), 0.05)',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(var(--primary-rgb), 0.15)',
  },
  actionLabel: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  actionValue: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
  },
  flagFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px',
  },
  topicText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  interveneBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--danger)',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  interventionsTableContainer: {
    overflowX: 'auto',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '12px',
    fontSize: '0.85rem',
  },
  courseBadge: {
    fontSize: '0.75rem',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  statusBadge: {
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  resolveBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    color: 'var(--success)',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '520px',
    padding: '1.75rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
    marginBottom: '14px',
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  actionModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalAlertBox: {
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    fontSize: '0.85rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  textareaField: {
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    outline: 'none',
    resize: 'vertical',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
