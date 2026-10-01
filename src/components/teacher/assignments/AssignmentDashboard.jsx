import React from 'react';
import { 
  FileText, Plus, Calendar, Award, CheckCircle2, 
  Clock, Edit, Trash2, Copy, Eye, PlayCircle, ArrowRight 
} from 'lucide-react';

export default function AssignmentDashboard({ 
  assignments, 
  courses, 
  selectedCourseId, 
  onCourseChange, 
  onCreateClick, 
  onViewSubmissions,
  onEditAssignment,
  onDuplicateAssignment,
  onDeleteAssignment,
  onCloseAssignment
}) {
  
  const draftCount = assignments.filter(a => a.status === 'Draft').length;
  const pubCount = assignments.filter(a => a.status === 'Published').length;
  const closedCount = assignments.filter(a => a.status === 'Closed').length;
  const pendingEvals = assignments.reduce((acc, a) => acc + (parseInt(a.pending_submissions) || 0), 0);

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageTitle}>Assignment Management</h2>
          <p style={styles.pageSubtitle}>
            Create, schedule, and evaluate practical labs and assignments across your courses.
          </p>
        </div>
        <button onClick={onCreateClick} style={styles.createBtn}>
          <Plus size={16} /> Create Assignment
        </button>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <KpiCard label="Total Assignments" value={assignments.length} icon={FileText} color="var(--primary)" />
        <KpiCard label="Published Active" value={pubCount} icon={PlayCircle} color="var(--success)" />
        <KpiCard label="Drafts / Scheduled" value={draftCount} icon={Edit} color="var(--text-muted)" />
        <KpiCard label="Pending Evaluations" value={pendingEvals} icon={Clock} color="var(--warning)" />
      </div>

      {/* Filters */}
      <div className="glass-card" style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Course Filter:</span>
          <select value={selectedCourseId} onChange={e => onCourseChange(e.target.value)} style={styles.selectField}>
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Table/List */}
      {assignments.length === 0 ? (
        <div className="glass-card" style={styles.emptyCard}>
          <FileText size={40} color="var(--text-muted)" />
          <h3>No Assignments Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Get started by creating a new practical assignment.</p>
          <button onClick={onCreateClick} style={styles.createBtn}><Plus size={16} /> Create Assignment</button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto', padding: '16px' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Assignment</th>
                <th style={styles.th}>Course & Topic</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Marks</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.assignment_id || a.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{a.title}</strong>
                    <br/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.category} • {a.difficulty}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '0.85rem' }}>{a.course_name || 'Course Name'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{a.topic_name || 'General'}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {a.due_at ? new Date(a.due_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (a.due_date || 'No Deadline')}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <strong>{a.max_marks}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: a.status === 'Published' ? 'var(--success-bg)' : a.status === 'Draft' ? 'var(--bg-secondary)' : 'var(--warning-bg)',
                      color: a.status === 'Published' ? 'var(--success)' : a.status === 'Draft' ? 'var(--text-muted)' : 'var(--warning)'
                    }}>
                      {a.status || 'Draft'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => onViewSubmissions(a)} style={styles.actionBtn} title="View Submissions">
                        <Eye size={15} color="var(--primary)" />
                      </button>
                      <button onClick={() => onEditAssignment(a)} style={styles.actionBtn} title="Edit Assignment">
                        <Edit size={15} color="var(--text-secondary)" />
                      </button>
                      <button onClick={() => onDuplicateAssignment(a)} style={styles.actionBtn} title="Duplicate Assignment">
                        <Copy size={15} color="var(--text-secondary)" />
                      </button>
                      {a.status !== 'Closed' && (
                        <button onClick={() => onCloseAssignment(a)} style={styles.actionBtn} title="Close Assignment">
                          <CheckCircle2 size={15} color="var(--warning)" />
                        </button>
                      )}
                      <button onClick={() => onDeleteAssignment(a.assignment_id || a.id)} style={styles.actionBtn} title="Delete">
                        <Trash2 size={15} color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card" style={styles.kpiCard}>
      <div style={styles.kpiHeader}>
        <span style={styles.kpiLabel}>{label}</span>
        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: `${color}15` }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <h3 style={styles.kpiValue}>{value}</h3>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  pageTitle: { fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' },
  pageSubtitle: { fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' },
  createBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', cursor: 'pointer', border: 'none' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' },
  kpiCard: { padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' },
  kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  kpiLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' },
  kpiValue: { fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' },
  filterRow: { padding: '14px 18px', display: 'flex', gap: '16px', alignItems: 'center' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  filterLabel: { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' },
  selectField: { padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px 14px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '14px', verticalAlign: 'middle', fontSize: '0.9rem', color: 'var(--text-primary)' },
  statusBadge: { padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' },
  actionBtn: { padding: '6px', borderRadius: '6px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyCard: { padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }
};
