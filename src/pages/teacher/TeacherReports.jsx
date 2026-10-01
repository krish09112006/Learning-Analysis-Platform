import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Table, 
  RefreshCw, 
  CheckCircle2, 
  Award, 
  BookOpen,
  Calendar,
  Printer
} from 'lucide-react';
import teacherService from '../../services/teacherService';

export default function TeacherReports({ teacher }) {
  const [reportType, setReportType] = useState('course_progress');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (type) => {
    try {
      setLoading(true);
      const res = await teacherService.getReports(teacher.user_id, type);
      setReportData(res);
    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const handleDownloadCsv = () => {
    const url = teacherService.getCsvReportUrl(teacher.user_id, reportType);
    window.open(url, '_blank');
  };

  const handleDownloadExcel = () => {
    // Generate formatted CSV with BOM for seamless opening in Microsoft Excel
    if (!reportData || !reportData.data || reportData.data.length === 0) return;
    const headers = reportData.headers || Object.keys(reportData.data[0]);
    const csvRows = [
      headers.join(','),
      ...reportData.data.map(row => 
        Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
      )
    ];
    const blob = new Blob(["\uFEFF" + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `faculty_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Top Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageTitle}>Academic Reports & Data Export</h2>
          <p style={styles.pageSubtitle}>
            Generate structured academic reports across course cohorts, quiz metrics, and practical assignments with one-click export.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadCsv} style={styles.csvExportBtn} title="Download standard CSV">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handleDownloadExcel} style={styles.excelExportBtn} title="Download Excel-compatible CSV">
            <FileText size={15} /> Export Excel
          </button>
          <button onClick={handlePrintPdf} style={styles.pdfExportBtn} title="Print or save as PDF">
            <Printer size={15} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Report Records</span>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
            {reportData?.data ? reportData.data.length : 0}
          </h4>
        </div>
        <div className="glass-card" style={{ padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Selected Pathway</span>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '1rem', color: 'var(--primary)' }}>
            {reportType === 'course_progress' ? 'Cohort Progress' : reportType === 'quiz_performance' ? 'Quiz Analytics' : 'Assignments'}
          </h4>
        </div>
        <div className="glass-card" style={{ padding: '14px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last Compiled</span>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {new Date().toLocaleTimeString()}
          </h4>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div style={styles.tabsRow}>
        <button
          onClick={() => setReportType('course_progress')}
          style={{
            ...styles.tabBtn,
            ...(reportType === 'course_progress' ? styles.tabBtnActive : {})
          }}
        >
          <BookOpen size={16} /> Course Cohort Progress
        </button>

        <button
          onClick={() => setReportType('quiz_performance')}
          style={{
            ...styles.tabBtn,
            ...(reportType === 'quiz_performance' ? styles.tabBtnActive : {})
          }}
        >
          <Award size={16} /> Quiz Evaluations Report
        </button>

        <button
          onClick={() => setReportType('assignments')}
          style={{
            ...styles.tabBtn,
            ...(reportType === 'assignments' ? styles.tabBtnActive : {})
          }}
        >
          <FileText size={16} /> Assignment Submissions & Marks
        </button>
      </div>

      {/* Report Table Card */}
      <div className="glass-card" style={styles.reportCard}>
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Table size={18} color="var(--primary)" />
            <h3 style={styles.cardTitle}>
              {reportType === 'course_progress' && "Student Cohort Syllabus Progress"}
              {reportType === 'quiz_performance' && "Historical Quiz Results & Percentage Log"}
              {reportType === 'assignments' && "Practical Assignment Evaluations"}
            </h3>
          </div>
          <button onClick={() => fetchReport(reportType)} style={styles.refreshBtn}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>
            <RefreshCw size={24} className="spin" color="var(--primary)" />
            <span>Compiling report records...</span>
          </div>
        ) : !reportData || !reportData.data || reportData.data.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ color: 'var(--text-muted)' }}>No records available for this report type.</p>
          </div>
        ) : (
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {reportData.headers && reportData.headers.map((h, i) => (
                    <th key={i} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, rIdx) => (
                  <tr key={rIdx} style={styles.tr}>
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} style={styles.td}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
  csvExportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--success)',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.88rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
  },
  excelExportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  pdfExportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  tabsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
  },
  reportCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '4rem',
    color: 'var(--text-muted)',
  },
  emptyBox: {
    padding: '3rem',
    textAlign: 'center',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border-color)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '12px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
  },
};
