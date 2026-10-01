import React, { useState } from 'react';
import { ArrowLeft, Save, PlayCircle, Check, X, FileText, Settings, Calendar, Award } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Information', icon: FileText },
  { id: 2, title: 'Instructions & Materials', icon: FileText },
  { id: 3, title: 'Submission Settings', icon: Settings },
  { id: 4, title: 'Schedule & Availability', icon: Calendar },
  { id: 5, title: 'Grading Configuration', icon: Award }
];

export default function AssignmentWizard({ 
  form, 
  setForm, 
  courses, 
  topics, 
  onSaveDraft, 
  onPublish, 
  onCancel,
  isSaving
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  const handleNext = () => {
    // Very basic validation before moving next
    if (currentStep === 1) {
      if (!form.title) return setError("Assignment Title is required");
      if (!form.course_id) return setError("Course selection is required");
    }
    setError('');
    setCurrentStep(Math.min(currentStep + 1, 5));
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onCancel} style={styles.iconBtn}><ArrowLeft size={18} /></button>
          <h2 style={styles.title}>{form.assignment_id ? 'Edit Assignment' : 'Create New Assignment'}</h2>
        </div>
        <div style={styles.actions}>
          <button onClick={onSaveDraft} disabled={isSaving} style={styles.draftBtn}>
            <Save size={15} /> Save Draft
          </button>
          <button onClick={onPublish} disabled={isSaving} style={styles.publishBtn}>
            <PlayCircle size={15} /> Publish Assignment
          </button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="glass-card" style={styles.stepperContainer}>
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isPassed = step.id < currentStep;
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                ...styles.stepCircle,
                backgroundColor: isActive ? 'var(--primary)' : isPassed ? 'var(--success)' : 'var(--bg-secondary)',
                color: (isActive || isPassed) ? '#fff' : 'var(--text-muted)'
              }}>
                {isPassed ? <Check size={14} /> : step.id}
              </div>
              <span style={{
                ...styles.stepLabel,
                color: isActive ? 'var(--primary)' : isPassed ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500'
              }}>
                {step.title}
              </span>
              {idx < STEPS.length - 1 && <div style={styles.stepLine} />}
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={styles.errorBanner}>{error}</div>
      )}

      {/* Main Form Content */}
      <div className="glass-card" style={styles.formContent}>
        {currentStep === 1 && (
          <div style={styles.stepBody}>
            <h3>1. Basic Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Assignment Title *</label>
                <input style={styles.input} type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Lab 1: Python Basics" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Assignment Code (Optional)</label>
                <input style={styles.input} type="text" value={form.assignment_code || ''} onChange={e => setForm({...form, assignment_code: e.target.value})} placeholder="e.g. CS101-LAB1" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Course *</label>
                <select style={styles.select} value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})}>
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Topic</label>
                <select style={styles.select} value={form.topic_id} onChange={e => setForm({...form, topic_id: e.target.value})}>
                  <option value="">-- General --</option>
                  {topics.map(t => <option key={t.id || t.topic_id} value={t.id || t.topic_id}>{t.name || t.topic_name}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <input style={styles.input} type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Lab, Project, Homework" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Difficulty Level</label>
                <select style={styles.select} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Short Description</label>
              <textarea style={styles.textarea} rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief overview of the assignment goals..." />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={styles.stepBody}>
            <h3>2. Instructions & Materials</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Detailed Instructions *</label>
              <textarea style={{...styles.textarea, minHeight: '180px'}} value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} placeholder="Enter detailed guidelines, steps, and expectations here..." />
            </div>
            {/* Minimal attachment stub - full implementation requires file upload APIs */}
            <div style={styles.attachmentBox}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <em>Note: File attachments for instructions will be supported in the next backend update.</em>
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={styles.stepBody}>
            <h3>3. Submission Settings</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Submission Type</label>
                <select style={styles.select} value={form.submission_type} onChange={e => setForm({...form, submission_type: e.target.value})}>
                  <option value="File Upload">File Upload</option>
                  <option value="Text Submission">Text Submission</option>
                  <option value="File and Text">File and Text</option>
                  <option value="External Link">External Link</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Allowed File Types</label>
                <input style={styles.input} type="text" value={form.allowed_file_types} onChange={e => setForm({...form, allowed_file_types: e.target.value})} placeholder="e.g. .pdf, .docx, .zip" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Maximum File Size (Bytes)</label>
                <input style={styles.input} type="number" value={form.max_file_size} onChange={e => setForm({...form, max_file_size: parseInt(e.target.value)})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Maximum Files Allowed</label>
                <input style={styles.input} type="number" min={1} max={10} value={form.max_files} onChange={e => setForm({...form, max_files: parseInt(e.target.value)})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Allow Resubmissions?</label>
                <select style={styles.select} value={form.allow_resubmission ? 'Yes' : 'No'} onChange={e => setForm({...form, allow_resubmission: e.target.value === 'Yes'})}>
                  <option value="No">No (Single Attempt)</option>
                  <option value="Yes">Yes (Multiple Attempts)</option>
                </select>
              </div>
              {form.allow_resubmission && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Maximum Attempts</label>
                  <input style={styles.input} type="number" min={2} max={10} value={form.max_attempts} onChange={e => setForm({...form, max_attempts: parseInt(e.target.value)})} />
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={styles.stepBody}>
            <h3>4. Schedule & Availability</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Start Date & Time</label>
                <input style={styles.input} type="datetime-local" value={form.start_at || ''} onChange={e => setForm({...form, start_at: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Due Date & Time *</label>
                <input style={styles.input} type="datetime-local" value={form.due_at || ''} onChange={e => setForm({...form, due_at: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Accept Late Submissions?</label>
                <select style={styles.select} value={form.accept_late_submissions ? 'Yes' : 'No'} onChange={e => setForm({...form, accept_late_submissions: e.target.value === 'Yes'})}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              {form.accept_late_submissions && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Late Submission Deadline</label>
                  <input style={styles.input} type="datetime-local" value={form.late_deadline || ''} onChange={e => setForm({...form, late_deadline: e.target.value})} />
                </div>
              )}
              {form.accept_late_submissions && (
                <div style={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                  <label style={styles.label}>Late Policy Explanation (Shown to students)</label>
                  <input style={styles.input} type="text" value={form.late_policy || ''} onChange={e => setForm({...form, late_policy: e.target.value})} placeholder="e.g. 10% penalty per day late" />
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div style={styles.stepBody}>
            <h3>5. Grading Configuration</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Maximum Marks *</label>
                <input style={styles.input} type="number" min={1} value={form.max_marks} onChange={e => setForm({...form, max_marks: parseInt(e.target.value)})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Passing Marks</label>
                <input style={styles.input} type="number" min={0} value={form.passing_marks || 0} onChange={e => setForm({...form, passing_marks: parseInt(e.target.value)})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Grading Method</label>
                <select style={styles.select} value={form.grading_method} onChange={e => setForm({...form, grading_method: e.target.value})}>
                  <option value="Manual Grading">Manual Grading</option>
                  <option value="Rubric-based Grading">Rubric-based Grading (Coming soon)</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Grade Release Mode</label>
                <select style={styles.select} value={form.grade_release_mode} onChange={e => setForm({...form, grade_release_mode: e.target.value})}>
                  <option value="Release after each evaluation">Automatic: Release after each evaluation</option>
                  <option value="Release manually by teacher">Manual: Release all together</option>
                </select>
              </div>
            </div>
            
            {form.grading_method === 'Rubric-based Grading' && (
              <div style={styles.attachmentBox}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Rubric criteria builder will be implemented in the next major update. Please use Manual Grading for now.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <button onClick={handlePrev} disabled={currentStep === 1} style={{...styles.navBtn, opacity: currentStep === 1 ? 0.5 : 1}}>
          Back
        </button>
        {currentStep < 5 ? (
          <button onClick={handleNext} style={styles.navBtnPrimary}>
            Continue Next Step
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onSaveDraft} disabled={isSaving} style={styles.navBtn}>Save as Draft</button>
            <button onClick={onPublish} disabled={isSaving} style={styles.navBtnPrimary}>Publish Assignment</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' },
  actions: { display: 'flex', gap: '12px' },
  draftBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)' },
  publishBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  stepperContainer: { display: 'flex', alignItems: 'center', padding: '16px 24px', overflowX: 'auto', gap: '8px' },
  stepCircle: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 },
  stepLabel: { fontSize: '0.85rem', marginLeft: '8px', whiteSpace: 'nowrap' },
  stepLine: { flex: 1, minWidth: '20px', height: '2px', backgroundColor: 'var(--border-color)', margin: '0 12px' },
  formContent: { padding: '24px', minHeight: '400px' },
  stepBody: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' },
  select: { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' },
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' },
  attachmentBox: { padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(var(--primary-rgb), 0.05)', border: '1px dashed var(--primary)', textAlign: 'center' },
  footer: { display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border-color)' },
  navBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)' },
  navBtnPrimary: { padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  errorBanner: { padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: '600', fontSize: '0.85rem' }
};
