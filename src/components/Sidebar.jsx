import React from 'react';
import { LayoutDashboard, BookOpen, BarChart3, User, Award, LogOut } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, studentName, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'analytics', label: 'Analytics & Advisor', icon: BarChart3 },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Logo Header */}
      <div style={styles.brandContainer}>
        <div style={styles.logoIcon}>
          <Award size={22} color="var(--primary)" />
        </div>
        <div>
          <h1 style={styles.brandTitle}>EduInsight</h1>
          <span style={styles.brandSubtitle}>Student Workspace</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={styles.navMenu}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <Icon size={20} style={isActive ? styles.iconActive : styles.icon} />
              <span>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}

        {/* Dynamic Sign Out button */}
        <button
          onClick={onLogout}
          style={{
            ...styles.navItem,
            marginTop: 'auto',
            color: 'var(--danger)',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
          }}
        >
          <LogOut size={20} style={{ color: 'var(--danger)' }} />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* Sidebar Footer User Card */}
      <div style={styles.sidebarFooter}>
        <div style={styles.footerInner}>
          <div style={styles.statusBadge}>Online</div>
          <div style={styles.userRole}>Portal Student</div>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 10,
    padding: '2rem 1rem 1.5rem 1rem',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '2.5rem',
    padding: '0 0.5rem',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(var(--primary-rgb), 0.1)',
    border: '1px solid rgba(var(--primary-rgb), 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.1)',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '-2px',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    fontSize: '0.95rem',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  navItemActive: {
    color: 'var(--text-primary)',
    backgroundColor: 'rgba(var(--primary-rgb), 0.08)',
    border: '1px solid rgba(var(--primary-rgb), 0.15)',
  },
  icon: {
    color: 'var(--text-muted)',
    transition: 'color 0.2s ease',
  },
  iconActive: {
    color: 'var(--primary)',
  },
  activeIndicator: {
    position: 'absolute',
    left: '-4px',
    top: '25%',
    height: '50%',
    width: '4px',
    backgroundColor: 'var(--primary)',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 10px var(--primary)',
  },
  sidebarFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: 'auto',
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    fontSize: '0.7rem',
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid var(--success-border)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '600',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
};
