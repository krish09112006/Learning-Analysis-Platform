import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, FileText, Download, X } from 'lucide-react';
import assignmentService from '../../../services/assignmentService';

export default function AssignmentSubmissions({ assignment, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks_awarded: '', feedback: '' });

  useEffect(() => {
    loadSubmissions();
  }, [assignment.id, assignment.assignment_id]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const subs = await assignmentService.getSubmissions(assignment.assignment_id || assignment.id);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openGrading = (sub) => {
    setGradingSubmission(sub);
    setGradeForm({
      marks_awarded: sub.marks_awarded !== null ? sub.marks_awarded : '',
      feedback: sub.feedback || ''
    });
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    try {
      await assignmentService.gradeSubmission(
        gradingSubmission.submission_id || gradingSubmission.id,
        gradeForm.marks_awarded,
        gradeForm.feedback
      );
      setGradingSubmission(null);
      loadSubmissions();
    } catch (err) {
      alert("Failed to save grade: " + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={styles.iconBtn}><ArrowLeft size={18} /></button>
          <div>
            <h2 style={styles.title}>Submissions: {assignment.title}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max Marks: {assignment.max_marks} | Due: {assignment.due_at || assignment.due_date}</span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={styles.content}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px' }} />
            <p>No student submissions received yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Submitted At</th>
                  <th style={styles.th}>Files</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.submission_id || sub.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={sub.student_avatar || `https://ui-avatars.com/api/?name=${sub.student_name || 'Student'}&background=random`} alt="" style={styles.avatar} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.9rem' }}>{sub.student_name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attempt {sub.attempt_number || 1}</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.85rem' }}>
                        {new Date(sub.submitted_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {sub.is_late == 1 && <span style={styles.lateBadge}>Late</span>}
                    </td>
                    <td style={styles.td}>
                      {(sub.file_name || sub.files?.length > 0) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)' }}>
                          <FileText size={14} /> {sub.file_name || `${sub.files.length} Files`}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Text only</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: (sub.status === 'Evaluated' || sub.status === 'Graded') ? 'var(--success-bg)' : sub.status === 'Late' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                        color: (sub.status === 'Evaluated' || sub.status === 'Graded') ? 'var(--success)' : sub.status === 'Late' ? 'var(--danger)' : 'var(--warning)'
                      }}>{sub.status}</span>
                    </td>
                    <td style={styles.td}>
                      {sub.marks_awarded !== null ? <strong>{sub.marks_awarded} / {assignment.max_marks}</strong> : <span style={{ color: 'var(--text-muted)' }}>--</span>}
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => openGrading(sub)} style={styles.gradeBtn}>
                        {sub.marks_awarded !== null ? 'Update Grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {gradingSubmission && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Evaluate: {gradingSubmission.student_name}</h3>
              <button onClick={() => setGradingSubmission(null)} style={styles.iconBtn}><X size={16} /></button>
            </div>
            
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Submission Content:</h4>
              {gradingSubmission.submission_text && (
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontStyle: 'italic' }}>"{gradingSubmission.submission_text}"</p>
              )}
              {gradingSubmission.file_name && (
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 12px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px' }}>
                  <Download size={14} /> Download {gradingSubmission.file_name}
                </button>
              )}
            </div>

            <form onSubmit={handleSaveGrade} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Marks Awarded (Max: {assignment.max_marks}) *</label>
                <input type="number" min={0} max={assignment.max_marks} value={gradeForm.marks_awarded} onChange={e => setGradeForm({...gradeForm, marks_awarded: e.target.value})} required style={styles.input} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Feedback / Comments</label>
                <textarea rows={3} value={gradeForm.feedback} onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})} style={styles.input} placeholder="Provide constructive feedback..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setGradingSubmission(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Save Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer', display: 'flex' },
  title: { margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' },
  content: { padding: '0' },
  th: { padding: '12px 16px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem', color: 'var(--text-primary)' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%' },
  lateBadge: { display: 'inline-block', marginLeft: '6px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.65rem', fontWeight: '700' },
  statusBadge: { padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' },
  gradeBtn: { padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { width: '100%', maxWidth: '500px', padding: '24px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }
};
