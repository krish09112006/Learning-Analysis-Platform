import React from 'react';
import { Award, BookOpen, Clock, Lock, ArrowRight, Star } from 'lucide-react';

export default function CourseSelection({ student, onEnroll }) {
  
  const coursesCatalog = [
    {
      id: "py-101",
      title: "Python Programming",
      instructor: "Dr. Alok Verma",
      duration: "8 Weeks",
      modulesCount: 8,
      rating: "4.8",
      active: true,
      description: "An introductory to intermediate course covering syntax, type conversions, loop algorithms, list matrices, custom functions, dictionaries, and Object-Oriented structures."
    },
    {
      id: "jv-101",
      title: "Java Masterclass",
      instructor: "Prof. Sarah Jenkins",
      duration: "10 Weeks",
      modulesCount: 10,
      rating: "4.7",
      active: false,
      description: "Explore robust Object-Oriented blueprints, interfaces, thread concurrency, streams, exception handling, and JDBC database connectors."
    },
    {
      id: "db-101",
      title: "Database Management Systems (DBMS)",
      instructor: "Dr. Rajesh Rao",
      duration: "8 Weeks",
      modulesCount: 8,
      rating: "4.9",
      active: false,
      description: "Master relational schema designs, table keys, normalization rules (1NF, 2NF, 3NF), index optimization, and SQL aggregations."
    },
    {
      id: "wd-101",
      title: "Web Development Architectures",
      instructor: "Alex Mercer",
      duration: "12 Weeks",
      modulesCount: 12,
      rating: "4.6",
      active: false,
      description: "Build clean layouts using modern CSS Flexbox/Grid, and create highly responsive single-page web applications using React.js."
    }
  ];

  return (
    <div style={styles.container}>
      
      {/* Header Banner */}
      <div style={styles.header}>
        <div style={styles.avatarMiniWrapper}>
          <Award size={20} color="#8b5cf6" />
          <span style={styles.userLabel}>Logged in as: <strong>{student.name}</strong></span>
        </div>
        <h1 style={styles.title}>Academic Course Catalog</h1>
        <p style={styles.subtitle}>Select a course pathway below to enroll, populate your syllabus workspace, and begin tracking performance metrics.</p>
      </div>

      {/* Catalog Grid */}
      <div style={styles.catalogGrid}>
        {coursesCatalog.map((course) => (
          <div 
            key={course.id} 
            className="glass-card animate-fade-in" 
            style={{
              ...styles.courseCard,
              ...(course.active ? styles.activeCard : {})
            }}
          >
            <div style={styles.cardHeader}>
              <span style={{
                ...styles.badge,
                backgroundColor: course.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                color: course.active ? '#10b981' : '#6b7280',
                border: `1px solid ${course.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`,
              }}>
                {course.active ? "Open Enrollment" : "Locked / Coming Soon"}
              </span>
              
              <div style={styles.ratingBox}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span style={styles.ratingText}>{course.rating}</span>
              </div>
            </div>

            <h3 style={styles.courseTitle}>{course.title}</h3>
            <span style={styles.instructor}>Instructor: <strong>{course.instructor}</strong></span>
            
            <p style={styles.courseDesc}>{course.description}</p>
            
            {/* Meta row */}
            <div style={styles.metaRow}>
              <div style={styles.metaItem}>
                <BookOpen size={14} color="#6b7280" />
                <span>{course.modulesCount} Modules</span>
              </div>
              <div style={styles.metaItem}>
                <Clock size={14} color="#6b7280" />
                <span>{course.duration}</span>
              </div>
            </div>

            <div style={styles.cardFooter}>
              {course.active ? (
                <button 
                  onClick={() => onEnroll(course.id)} 
                  style={styles.enrollBtn}
                >
                  Enroll & Begin Learning <ArrowRight size={16} />
                </button>
              ) : (
                <div style={styles.lockedBox}>
                  <Lock size={14} color="#6b7280" />
                  <span>Prerequisite Syllabus Required</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0b0f19',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundAttachment: 'fixed',
    backgroundImage: 
      'radial-gradient(at 50% 0%, rgba(139, 92, 246, 0.08) 0px, transparent 50%)',
  },
  header: {
    textAlign: 'center',
    maxWidth: '720px',
    marginBottom: '3rem',
  },
  avatarMiniWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '4px 12px',
    borderRadius: '20px',
    marginBottom: '1rem',
  },
  userLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    marginTop: '8px',
    lineHeight: '1.5',
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '1200px',
  },
  courseCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '360px',
    padding: '2rem',
    transition: 'all 0.3s ease',
  },
  activeCard: {
    border: '1px solid rgba(139, 92, 246, 0.2)',
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '600',
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  ratingText: {
    fontSize: '0.7rem',
    color: '#f59e0b',
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: '1.25rem',
    color: '#f3f4f6',
    fontWeight: '700',
    marginTop: '1.25rem',
    fontFamily: "'Outfit', sans-serif",
  },
  instructor: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '2px',
    display: 'block',
  },
  courseDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '10px',
    lineHeight: '1.45',
    flexGrow: 1,
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '1.25rem',
    marginBottom: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  enrollBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    boxShadow: '0 0 15px rgba(139,92,246,0.3)',
    transition: 'all 0.2s ease',
  },
  lockedBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    border: '1px solid rgba(255,255,255,0.03)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#6b7280',
  },
};
