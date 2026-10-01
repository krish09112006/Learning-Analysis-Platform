import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Sun, 
  Moon, 
  Bell, 
  Check, 
  X, 
  Save, 
  Building, 
  Award,
  BookOpen
} from 'lucide-react';
import authService from '../../services/authService';

export default function TeacherProfileModal({ 
  isOpen, 
  onClose, 
  teacher, 
  themeMode, 
  onToggleTheme,
  onProfileUpdated 
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'preferences'
  
  // Profile Form
  const [name, setName] = useState(teacher?.name || 'Dr. Alok Verma');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Associate Professor & Curriculum Lead');
  const [officeHours, setOfficeHours] = useState('Mon - Thu, 2:00 PM - 4:00 PM');
  
  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [submissionAlerts, setSubmissionAlerts] = useState(true);
  const [atRiskAlerts, setAtRiskAlerts] = useState(true);

  // Status message
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      await authService.updateProfile(teacher.user_id, name);
      
      const updated = {
        ...teacher,
        name
      };
      localStorage.setItem('lap_current_user', JSON.stringify(updated));
      if (onProfileUpdated) onProfileUpdated(updated);

      setMessage({ text: 'Profile successfully updated.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({ text: 'Please enter your current password.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      // Call profile update or password endpoint
      await fetch('http://localhost/learning-analytics-backend/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          user_id: teacher.user_id,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      setMessage({ text: 'Password successfully changed.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.message || 'Failed to change password.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-card animate-fade-in" style={styles.modal}>
        
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.avatarBox}>
              <User size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={styles.modalTitle}>Faculty Profile & Settings</h3>
              <span style={styles.modalSubtitle}>{teacher?.email || 'alok.verma@college.edu'}</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Status Message */}
        {message.text && (
          <div style={{
            ...styles.alertBanner,
            backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            borderColor: message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)'
          }}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={styles.tabNav}>
          <button 
            onClick={() => { setActiveTab('profile'); setMessage({ text: '', type: '' }); }}
            style={{ ...styles.tabBtn, ...(activeTab === 'profile' ? styles.tabBtnActive : {}) }}
          >
            <User size={15} /> Personal & Academic
          </button>
          <button 
            onClick={() => { setActiveTab('security'); setMessage({ text: '', type: '' }); }}
            style={{ ...styles.tabBtn, ...(activeTab === 'security' ? styles.tabBtnActive : {}) }}
          >
            <Lock size={15} /> Security & Password
          </button>
          <button 
            onClick={() => { setActiveTab('preferences'); setMessage({ text: '', type: '' }); }}
            style={{ ...styles.tabBtn, ...(activeTab === 'preferences' ? styles.tabBtnActive : {}) }}
          >
            <Bell size={15} /> Preferences & Theme
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} style={styles.form}>
            <div style={styles.rowTwoCols}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name & Salutation</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  style={styles.input} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Registered College Email</label>
                <input 
                  type="email" 
                  value={teacher?.email || 'alok.verma@college.edu'} 
                  disabled 
                  style={{ ...styles.input, opacity: 0.7, cursor: 'not-allowed' }} 
                />
              </div>
            </div>

            <div style={styles.rowTwoCols}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Department / Faculty</label>
                <input 
                  type="text" 
                  value={department} 
                  onChange={e => setDepartment(e.target.value)} 
                  style={styles.input} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Academic Designation</label>
                <input 
                  type="text" 
                  value={designation} 
                  onChange={e => setDesignation(e.target.value)} 
                  style={styles.input} 
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Office Hours & Student Advisory Schedule</label>
              <input 
                type="text" 
                value={officeHours} 
                onChange={e => setOfficeHours(e.target.value)} 
                style={styles.input} 
              />
            </div>

            <div style={styles.footer}>
              <button type="button" onClick={onClose} style={styles.secondaryBtn}>Close</button>
              <button type="submit" disabled={saving} style={styles.primaryBtn}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: Security */}
        {activeTab === 'security' && (
          <form onSubmit={handleSavePassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password</label>
              <input 
                type="password" 
                placeholder="Enter current password..."
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
                required 
                style={styles.input} 
              />
            </div>

            <div style={styles.rowTwoCols}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input 
                  type="password" 
                  placeholder="Minimum 6 characters..."
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                  style={styles.input} 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Re-type new password..."
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                  style={styles.input} 
                />
              </div>
            </div>

            <div style={styles.footer}>
              <button type="button" onClick={onClose} style={styles.secondaryBtn}>Close</button>
              <button type="submit" disabled={saving} style={styles.primaryBtn}>
                <Lock size={16} /> {saving ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: Preferences & Theme */}
        {activeTab === 'preferences' && (
          <div style={styles.form}>
            <div style={styles.preferenceItem}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.92rem' }}>Interface Appearance Mode</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Current: {themeMode === 'dark' ? 'Dark Modern Theme' : 'Light Clean Theme'}
                </span>
              </div>
              <button onClick={onToggleTheme} style={styles.themeToggleBtn}>
                {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Switch to {themeMode === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>

            <div style={styles.preferenceItem}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.92rem' }}>Assignment Submission Notifications</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Receive in-app alerts when students submit exercises</span>
              </div>
              <input 
                type="checkbox" 
                checked={submissionAlerts} 
                onChange={e => setSubmissionAlerts(e.target.checked)} 
                style={{ width: '18px', height: '18px' }}
              />
            </div>

            <div style={styles.preferenceItem}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.92rem' }}>Automated Student Risk Alerts</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Flag students whose quiz score drops below 50%</span>
              </div>
              <input 
                type="checkbox" 
                checked={atRiskAlerts} 
                onChange={e => setAtRiskAlerts(e.target.checked)} 
                style={{ width: '18px', height: '18px' }}
              />
            </div>

            <div style={styles.footer}>
              <button type="button" onClick={onClose} style={styles.primaryBtn}>Done</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modal: {
    width: '100%',
    maxWidth: '640px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  avatarBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(var(--primary-rgb), 0.12)',
    border: '1px solid rgba(var(--primary-rgb), 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  alertBanner: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    border: '1px solid',
  },
  tabNav: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tabBtnActive: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--primary)',
    border: '1px solid var(--border-color)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rowTwoCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  preferenceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
  },
  themeToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
  }
};
