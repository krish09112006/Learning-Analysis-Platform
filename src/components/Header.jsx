import React, { useState } from 'react';
import { Bell, Clock, Play, Pause, Square, Check, Sun, Moon } from 'lucide-react';

export default function Header({ 
  student, 
  userRole = 'Student',
  studyTimer, 
  startTimer, 
  pauseTimer, 
  stopTimer, 
  notifications, 
  markNotificationsAsRead,
  themeMode,
  onToggleTheme,
  onOpenProfile
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const isTeacher = userRole === 'Teacher' || student?.role === 'Teacher';
  const displayName = student?.profile?.name || student?.name || (isTeacher ? 'Instructor' : 'Student');

  const formatTime = (secs) => {
    if (!secs) return "00:00:00";
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const unreadCount = notifications ? notifications.filter(n => n.unread).length : 0;

  return (
    <header style={styles.header}>
      {/* Page Context/Greeting */}
      <div>
        <h2 style={styles.welcomeText}>Hello, {displayName}! 👋</h2>
        <p style={styles.subtext}>
          {isTeacher 
            ? "Faculty instruction & academic performance management portal."
            : "Let's check your learning progress today."}
        </p>
      </div>

      {/* Global Controls & Profile */}
      <div style={styles.rightSection}>
        
        {/* Quick Study Session Controls for Students */}
        {!isTeacher && studyTimer && (
          <div style={{
            ...styles.timerContainer,
            backgroundColor: studyTimer.isActive ? 'rgba(var(--primary-rgb), 0.08)' : 'rgba(255,255,255,0.02)',
            borderColor: studyTimer.isActive ? 'rgba(var(--primary-rgb), 0.25)' : 'var(--border-color)',
          }}>
            <div style={styles.timerIconWrapper}>
              <Clock size={16} color={studyTimer.isActive ? 'var(--primary)' : 'var(--text-muted)'} />
            </div>
            
            <div style={styles.timerInfo}>
              <span style={styles.timerLabel}>
                {studyTimer.isActive ? (studyTimer.isPaused ? 'Study Paused' : 'Studying...') : 'Study Session'}
              </span>
              <span style={{
                ...styles.timerValue,
                color: studyTimer.isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {formatTime(studyTimer.seconds)}
              </span>
            </div>

            <div style={styles.timerControls}>
            {!studyTimer.isActive ? (
              <button 
                onClick={startTimer} 
                style={styles.controlBtn} 
                data-tooltip="Start Study Session"
              >
                <Play size={14} fill="var(--success)" color="var(--success)" />
              </button>
            ) : (
              <>
                {studyTimer.isPaused ? (
                  <button 
                    onClick={startTimer} 
                    style={styles.controlBtn} 
                    data-tooltip="Resume Study"
                  >
                    <Play size={14} fill="var(--primary)" color="var(--primary)" />
                  </button>
                ) : (
                  <button 
                    onClick={pauseTimer} 
                    style={styles.controlBtn} 
                    data-tooltip="Pause Study"
                  >
                    <Pause size={14} fill="var(--warning)" color="var(--warning)" />
                  </button>
                )}
                <button 
                  onClick={stopTimer} 
                  style={styles.controlBtn} 
                  data-tooltip="End and Save Session"
                >
                  <Square size={14} fill="var(--danger)" color="var(--danger)" />
                </button>
              </>
            )}
          </div>
        </div>
        )}

        {/* Notifications System */}
        <div style={styles.notificationWrapper}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            style={{
              ...styles.notificationBtn,
              backgroundColor: showNotifications ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.02)'
            }}
          >
            <Bell size={18} color={unreadCount > 0 ? 'var(--primary)' : 'var(--text-secondary)'} />
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Notifications</span>
                {unreadCount > 0 ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationsAsRead();
                    }}
                    style={styles.markReadBtn}
                  >
                    <Check size={12} style={{ marginRight: '4px' }} /> Mark all as read
                  </button>
                ) : (
                  <span style={styles.allReadText}>All read</span>
                )}
              </div>
              <div style={styles.dropdownList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotifications}>No new notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{
                      ...styles.notificationItem,
                      borderLeft: n.unread ? '3px solid var(--primary)' : '3px solid transparent'
                    }}>
                      <p style={styles.notificationText}>{n.text}</p>
                      <span style={styles.notificationTime}>{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Mode Toggle Button */}
        <button 
          onClick={onToggleTheme} 
          style={styles.themeToggleBtn}
          data-tooltip={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {themeMode === 'dark' ? (
            <Sun size={18} color="var(--primary)" />
          ) : (
            <Moon size={18} color="var(--primary)" />
          )}
        </button>

        {/* Vertical Divider */}
        <div style={styles.divider} />

        {/* Profile Card */}
        <div 
          onClick={onOpenProfile}
          style={{
            ...styles.profileCard,
            cursor: onOpenProfile ? 'pointer' : 'default',
            padding: '4px 10px',
            borderRadius: '8px',
            border: onOpenProfile ? '1px solid var(--border-color)' : '1px solid transparent',
            backgroundColor: onOpenProfile ? 'rgba(255,255,255,0.02)' : 'transparent',
            transition: 'all 0.15s ease'
          }}
          data-tooltip={onOpenProfile ? "Open Profile & Settings" : undefined}
        >
          <div style={styles.profileDetails}>
            <span style={styles.profileName}>{displayName}</span>
            <span style={styles.profileEmail}>{student?.profile?.email || student?.email || ''}</span>
          </div>
        </div>

      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    position: 'fixed',
    top: 0,
    left: '260px',
    right: 0,
    height: '80px',
    zIndex: 9,
    backdropFilter: 'blur(20px)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
  },
  welcomeText: {
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontFamily: "'Outfit', sans-serif",
  },
  subtext: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    transition: 'all 0.3s ease',
  },
  timerIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '95px',
  },
  timerLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  timerValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    lineHeight: '1.1',
  },
  timerControls: {
    display: 'flex',
    gap: '4px',
  },
  controlBtn: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '0.65rem',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    boxShadow: '0 0 8px rgba(var(--primary-rgb), 0.6)',
  },
  dropdown: {
    position: 'absolute',
    top: '52px',
    right: '0',
    width: '320px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 15px rgba(var(--primary-rgb),0.05)',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease',
    zIndex: 100,
  },
  dropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  dropdownTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  newTag: {
    fontSize: '0.7rem',
    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
    color: 'var(--primary)',
    padding: '1px 6px',
    borderRadius: '8px',
    fontWeight: '600',
  },
  markReadBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '0.7rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  allReadText: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  dropdownList: {
    maxHeight: '240px',
    overflowY: 'auto',
  },
  emptyNotifications: {
    padding: '24px 16px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  notificationItem: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.15s ease',
    backgroundColor: 'rgba(255,255,255,0.01)',
    cursor: 'pointer',
  },
  notificationText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '4px',
  },
  themeToggleBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  divider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'var(--border-color)',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  profileEmail: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
};
