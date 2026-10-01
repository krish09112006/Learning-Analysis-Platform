import React from 'react';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  AlertTriangle,
  Download,
  BookOpen,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';

const MODULE_CONFIGS = {
  teacher_dashboard: {
    title: 'Faculty Workspace Overview',
    subtitle: 'High-level summary of your academic courses, assessments, and student activity.',
    badge: 'Overview Shell',
    icon: LayoutDashboard,
    cards: [
      { label: 'Active Courses', value: '3 Courses', note: 'Python, DBMS, Web Dev' },
      { label: 'Active Assessments', value: '6 Quizzes', note: 'Manual & Smart Builder' },
      { label: 'Course Assignments', value: '3 Assignments', note: 'Practical Lab Modules' },
      { label: 'Enrolled Students', value: '45 Students', note: 'Active Semester Cohort' }
    ],
    sections: [
      { title: 'Curriculum & Course Authoring', desc: 'Create manual courses or synthesize structured drafts with the LLM Course Generator.', actionLabel: 'Open Course Management', target: 'teacher_courses' },
      { title: 'Quiz Management & Smart Builder', desc: 'Manage quizzes, generate assessments with Smart Quiz Builder, and maintain your Topic Question Bank.', actionLabel: 'Open Quiz Management', target: 'teacher_quizzes' },
      { title: 'Assignments & Lab Submissions', desc: 'Track student lab assignments, project deadlines, and submission statuses.', actionLabel: 'View Assignments', target: 'teacher_assignments' }
    ]
  },
  teacher_assignments: {
    title: 'Assignments & Practical Labs',
    subtitle: 'Top-level overview of course assignments, project deliverables, and submission queues.',
    badge: 'Assignments Module',
    icon: FileText,
    cards: [
      { label: 'Total Assignments', value: '3 Active', note: 'Across 3 Courses' },
      { label: 'Submitted Projects', value: '28 Submissions', note: 'On-time student uploads' },
      { label: 'Pending Review', value: '4 Pending', note: 'Awaiting faculty grading' },
      { label: 'Average Score', value: '84%', note: 'Cohort lab performance' }
    ],
    sections: [
      { title: 'Lab 1: Python Control Flow & Functions', desc: 'Course: Python Programming • Due: Next Friday • Max Marks: 100', status: 'Active' },
      { title: 'Lab 2: Relational Schema & SQL Normalization', desc: 'Course: Database Management Systems • Due: In 10 Days • Max Marks: 100', status: 'Active' },
      { title: 'Project 1: Responsive Frontend Portfolio', desc: 'Course: Full-Stack Web Development • Due: End of Month • Max Marks: 100', status: 'Scheduled' }
    ]
  },
  teacher_analytics: {
    title: 'Student Performance Analytics',
    subtitle: 'High-level cohort mastery metrics, topic completion trends, and engagement indicators.',
    badge: 'Analytics Overview',
    icon: BarChart3,
    cards: [
      { label: 'Cohort Completion Rate', value: '76%', note: 'Syllabus topic progress' },
      { label: 'Mean Quiz Mastery', value: '78.5%', note: 'Across published quizzes' },
      { label: 'Active Weekly Learners', value: '41 / 45', note: '91% weekly participation' },
      { label: 'Avg Study Session', value: '4.2 hrs/wk', note: 'Portal tracked time' }
    ],
    sections: [
      { title: 'Course-Level Mastery Summary', desc: 'Python Programming (81% avg) • Database Systems (74% avg) • Web Development (79% avg)', status: 'Synced' },
      { title: 'Topic Competency Tracking', desc: 'Tracks student accuracy across variables, loops, functions, and relational keys.', status: 'Live' }
    ]
  },
  teacher_interventions: {
    title: 'Academic Interventions Panel',
    subtitle: 'Early-warning indicators and faculty outreach summary for students needing academic support.',
    badge: 'Support & Outreach',
    icon: AlertTriangle,
    cards: [
      { label: 'Flagged Students', value: '3 Students', note: 'Score below 50% threshold' },
      { label: 'Sent Reminders', value: '8 Notices', note: 'Automated & faculty alerts' },
      { label: 'Resolved Cases', value: '5 Improved', note: 'Post-remediation recovery' },
      { label: 'Advisor Status', value: 'Active', note: 'Monitoring enabled' }
    ],
    sections: [
      { title: 'Remedial Practice Recommendations', desc: 'Assigns targeted practice topics and quiz retakes to at-risk learners.', status: 'Configured' },
      { title: 'Faculty Notification History', desc: 'Logs outreach messages and deadline reminders sent to students.', status: 'Active' }
    ]
  },
  teacher_reports: {
    title: 'Academic Reports & Export',
    subtitle: 'Summary of downloadable academic rosters, gradebooks, and semester assessment summaries.',
    badge: 'Export Center',
    icon: Download,
    cards: [
      { label: 'Course Gradebooks', value: 'Ready', note: 'CSV / Excel / PDF formats' },
      { label: 'Quiz Score Sheets', value: '6 Reports', note: 'Attempt & accuracy logs' },
      { label: 'Attendance & Progress', value: 'Synced', note: 'Topic completion records' },
      { label: 'Last Compiled', value: 'Today', note: 'Real-time database snapshot' }
    ],
    sections: [
      { title: 'Semester Assessment Summary Report', desc: 'Consolidated overview of course completion, quiz averages, and assignment marks.', status: 'Available' },
      { title: 'Question Bank & Curriculum Audit', desc: 'Overview of published modules, topics, and reusable assessment items.', status: 'Available' }
    ]
  }
};

export default function TeacherModuleShell({ moduleKey = 'teacher_assignments', setActivePage }) {
  const cfg = MODULE_CONFIGS[moduleKey] || MODULE_CONFIGS.teacher_assignments;
  const IconComp = cfg.icon || FileText;

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Top Module Header */}
      <div className="glass-card" style={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={styles.iconBox}>
            <IconComp size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={styles.badge}>{cfg.badge}</span>
            <h2 style={styles.title}>{cfg.title}</h2>
            <p style={styles.subtitle}>{cfg.subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setActivePage('teacher_courses')} style={styles.secondaryBtn}>
            <BookOpen size={15} /> Create & Manage Courses
          </button>
          <button onClick={() => setActivePage('teacher_quizzes')} style={styles.primaryBtn}>
            <HelpCircle size={15} /> Open Quiz Management
          </button>
        </div>
      </div>

      {/* Top-Level KPI Summary Cards */}
      <div style={styles.kpiGrid}>
        {cfg.cards.map((c, idx) => (
          <div key={idx} className="glass-card" style={styles.kpiCard}>
            <span style={styles.kpiLabel}>{c.label}</span>
            <strong style={styles.kpiValue}>{c.value}</strong>
            <span style={styles.kpiNote}>{c.note}</span>
          </div>
        ))}
      </div>

      {/* High-Level Module Cards (No heavy inner details) */}
      <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          Module Overview
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cfg.sections.map((sec, i) => (
            <div key={i} style={styles.sectionItem}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{sec.title}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>{sec.desc}</p>
              </div>
              {sec.target ? (
                <button onClick={() => setActivePage(sec.target)} style={styles.secondaryBtn}>
                  {sec.actionLabel}
                </button>
              ) : (
                <span style={styles.statusPill}>{sec.status || 'Active'}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '18px' },
  headerCard: { padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  iconBox: { width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid rgba(var(--primary-rgb), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' },
  title: { margin: '2px 0 0 0', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' },
  kpiCard: { padding: '18px', display: 'flex', flexDirection: 'column', gap: '4px' },
  kpiLabel: { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' },
  kpiValue: { fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' },
  kpiNote: { fontSize: '0.76rem', color: 'var(--primary)', fontWeight: '500' },
  sectionItem: { padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  statusPill: { padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.12)', color: 'var(--success)' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '9px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', fontSize: '0.84rem', cursor: 'pointer' },
  secondaryBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '9px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.84rem', cursor: 'pointer' }
};
