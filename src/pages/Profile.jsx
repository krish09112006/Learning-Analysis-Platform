import React, { useState } from 'react';
import { User, Mail, Award, Clock, FileText, CheckSquare, Activity, RefreshCw } from 'lucide-react';

export default function Profile({ student, updateProfile, activityLog, onResetProgress }) {
  const [name, setName] = useState(student.profile.name);
  const [email, setEmail] = useState(student.profile.email);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (/\d/.test(name)) {
      alert('Full Name must not contain numbers.');
      return;
    }
    if (!name.trim().includes(' ')) {
      alert('Please enter both your first name and last name separated by a space.');
      return;
    }
    
    // Single letter name validation
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.some(part => part.length < 2)) {
      alert('Each part of the name must be at least 2 characters long (no single letters).');
      return;
    }

    updateProfile(name, email);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("⚠️ RESET PROGRESS:\n\nAre you sure you want to reset all quiz scores, completed topics, and assignment submissions? This will restore the platform to its default demonstration state.")) {
      onResetProgress();
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Profile Card & Form Column */}
      <div style={styles.profileLayout}>
        
        {/* Left Card: Summary Profile View */}
        <div className="glass-card" style={styles.profileCard}>
          <div style={styles.avatarWrapper}>
            <div style={styles.defaultUserIcon}>
              <User size={36} color="#8b5cf6" />
            </div>
            <div style={styles.roleBadge}>STUDENT</div>
          </div>
          <h3 style={styles.userName}>{student.profile.name}</h3>
          <span style={styles.userEmail}>{student.profile.email}</span>
          
          <div style={styles.statListDivider} />
          
          <div style={styles.statsSummary}>
            <div style={styles.summaryItem}>
              <Award size={16} color="#8b5cf6" />
              <div>
                <span style={styles.summaryLabel}>Topics Completed</span>
                <h4 style={styles.summaryValue}>{student.completedTopics.length} Modules</h4>
              </div>
            </div>
            <div style={styles.summaryItem}>
              <Clock size={16} color="#6366f1" />
              <div>
                <span style={styles.summaryLabel}>Study Hours</span>
                <h4 style={styles.summaryValue}>{(student.totalStudySeconds / 3600).toFixed(1)} Hours</h4>
              </div>
            </div>
          </div>

          <button onClick={handleReset} style={styles.resetBtn}>
            <RefreshCw size={14} /> Reset Demo Workspace
          </button>
        </div>

        {/* Right Card: Modify Form */}
        <div className="glass-card" style={styles.formCard}>
          <h3 style={styles.cardHeading}>Academic Profile Settings</h3>
          <p style={styles.cardDesc}>Modify your personal workspace details. This is cached locally during student demonstrations.</p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={16} style={styles.inputIcon} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={styles.input} 
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={styles.input} 
                  required
                />
              </div>
            </div>

            <button type="submit" style={styles.saveBtn}>
              Save Settings
            </button>

            {isSaved && (
              <span className="animate-fade-in" style={styles.saveSuccess}>
                ✓ Changes saved successfully!
              </span>
            )}
          </form>
        </div>

      </div>

      {/* Activity Timeline Card */}
      <div className="glass-card" style={styles.activityCard}>
        <h3 style={styles.activityTitle}>
          <Activity size={18} style={styles.activityIcon} /> Workspace Log Timeline
        </h3>
        <p style={styles.activitySubtitle}>Chronological record of student learning sessions, quiz submissions, and material resource downloads.</p>

        <div style={styles.timeline}>
          {activityLog.length === 0 ? (
            <div style={styles.emptyTimeline}>No logs recorded yet. Start studying or complete quizzes!</div>
          ) : (
            activityLog.map((log, index) => (
              <div key={index} style={styles.timelineItem}>
                <div style={styles.timelineIndicator}>
                  <div style={styles.indicatorDot} />
                  {index < activityLog.length - 1 && <div style={styles.indicatorLine} />}
                </div>
                <div style={styles.timelineContent}>
                  <p style={styles.timelineText}>{log.text}</p>
                  <span style={styles.timelineTime}>{log.time}</span>
                </div>
              </div>
            ))
          )}
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
  profileLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '20px',
  },
  profileCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2.5rem 1.5rem',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: '1rem',
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '24px',
    objectFit: 'cover',
    border: '2px solid rgba(139, 92, 246, 0.4)',
  },
  defaultUserIcon: {
    width: '100px',
    height: '100px',
    borderRadius: '24px',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    border: '2px solid rgba(139, 92, 246, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '2px 10px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  userName: {
    fontSize: '1.25rem',
    color: '#f3f4f6',
    fontWeight: '700',
    fontFamily: "'Outfit', sans-serif",
  },
  userEmail: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '2px',
  },
  statListDivider: {
    height: '1px',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: '1.5rem 0',
  },
  statsSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '100%',
    textAlign: 'left',
    padding: '0 8px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  summaryLabel: {
    fontSize: '0.7rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: '0.9rem',
    color: '#e5e7eb',
    fontWeight: '600',
  },
  resetBtn: {
    marginTop: '2rem',
    width: '100%',
    padding: '10px',
    border: '1px solid rgba(244,63,94,0.2)',
    borderRadius: '8px',
    backgroundColor: 'rgba(244,63,94,0.02)',
    color: '#f43f5e',
    fontSize: '0.8rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  formCard: {
    padding: '2rem',
  },
  cardHeading: {
    fontSize: '1.15rem',
    color: '#f3f4f6',
    fontWeight: '600',
    fontFamily: "'Outfit', sans-serif",
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  form: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '0 12px',
    height: '42px',
  },
  inputIcon: {
    color: '#6b7280',
    marginRight: '10px',
  },
  input: {
    flexGrow: 1,
    height: '100%',
    fontSize: '0.85rem',
    color: '#f3f4f6',
    outline: 'none',
  },
  saveBtn: {
    alignSelf: 'flex-start',
    padding: '10px 24px',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginTop: '8px',
    boxShadow: '0 0 15px rgba(139,92,246,0.3)',
  },
  saveSuccess: {
    fontSize: '0.8rem',
    color: '#10b981',
    fontWeight: '600',
    marginTop: '8px',
  },
  activityCard: {
    padding: '2rem',
  },
  activityTitle: {
    fontSize: '1.15rem',
    color: '#f3f4f6',
    fontWeight: '600',
    fontFamily: "'Outfit', sans-serif",
    display: 'flex',
    alignItems: 'center',
  },
  activityIcon: {
    marginRight: '8px',
  },
  activitySubtitle: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '4px',
  },
  timeline: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyTimeline: {
    padding: '24px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.8rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
    minHeight: '50px',
  },
  timelineIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '12px',
  },
  indicatorDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#6366f1',
    borderRadius: '50%',
    border: '2px solid #0f1422',
    boxShadow: '0 0 8px #6366f1',
  },
  indicatorLine: {
    width: '2px',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  timelineContent: {
    paddingBottom: '16px',
  },
  timelineText: {
    fontSize: '0.85rem',
    color: '#e5e7eb',
    fontWeight: '500',
    marginTop: '-3px',
  },
  timelineTime: {
    fontSize: '0.7rem',
    color: '#6b7280',
    display: 'block',
    marginTop: '2px',
  },
};
