import React from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Lightbulb, TrendingUp, BookOpen, Clock } from 'lucide-react';

export default function Analytics({ student, course, analytics }) {
  
  // 1. Math Data for Quiz Line Chart (SVG)
  const maxScore = 100;
  const attempts = student.quizAttempts;
  const lineChartWidth = 500;
  const lineChartHeight = 180;
  const padding = 30;

  // Plotting coordinates for line chart
  const getLineCoordinates = () => {
    if (attempts.length === 0) return "";
    const xStep = (lineChartWidth - padding * 2) / Math.max(1, attempts.length - 1);
    return attempts.map((attempt, index) => {
      const x = padding + index * xStep;
      const y = lineChartHeight - padding - (attempt.percent / maxScore) * (lineChartHeight - padding * 2);
      return { x, y, percent: attempt.percent, label: `Quiz ${attempt.topicId}` };
    });
  };

  const coords = getLineCoordinates();
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(" ");

  // 2. Math Data for Study Session Bar Chart (SVG)
  const barChartWidth = 500;
  const barChartHeight = 180;
  const studyData = student.studySessions;
  const maxHours = Math.max(...studyData.map(d => d.hours), 1);

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Upper Cards: Quick Performance Metrics */}
      <div style={styles.metricsGrid}>
        
        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Learning Velocity</span>
            <TrendingUp size={16} color="#6366f1" />
          </div>
          <h3 style={styles.metricValue}>
            {(student.completedTopics.length / Math.max(1, student.quizAttempts.length)).toFixed(1)}x
          </h3>
          <p style={styles.metricDesc}>Completion-to-quiz attempt ratio</p>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Syllabus Coverage</span>
            <BookOpen size={16} color="#8b5cf6" />
          </div>
          <h3 style={styles.metricValue}>{analytics.progressPercent}%</h3>
          <p style={styles.metricDesc}>Modules fully explored and marked done</p>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricTitle}>Weekly Time Avg</span>
            <Clock size={16} color="#10b981" />
          </div>
          <h3 style={styles.metricValue}>
            {(studyData.reduce((sum, d) => sum + d.hours, 0) / studyData.length).toFixed(1)} hrs
          </h3>
          <p style={styles.metricDesc}>Average daily learning duration</p>
        </div>

      </div>

      {/* Charts Row: High Fidelity SVG Charts */}
      <div style={styles.chartsGrid}>
        
        {/* SVG Quiz Line Chart */}
        <div className="glass-card" style={styles.chartWrapper}>
          <h4 style={styles.chartTitle}>Quiz Score Progression (%)</h4>
          {attempts.length === 0 ? (
            <div style={styles.emptyChart}>Take a quiz in Courses tab to see trends!</div>
          ) : (
            <div style={styles.svgContainer}>
              <svg width="100%" height="100%" viewBox={`0 0 ${lineChartWidth} ${barChartHeight}`}>
                {/* Horizontal Guide Lines */}
                {[0, 25, 50, 75, 100].map((gridVal) => {
                  const y = lineChartHeight - padding - (gridVal / 100) * (lineChartHeight - padding * 2);
                  return (
                    <g key={gridVal}>
                      <line x1={padding} y1={y} x2={lineChartWidth - padding} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <text x={padding - 8} y={y + 4} fill="#6b7280" fontSize="10" textAnchor="end">{gridVal}%</text>
                    </g>
                  );
                })}
                {/* Connection Path Line */}
                {coords.length > 1 && (
                  <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth="3" strokeLinecap="round" />
                )}
                {/* Glowing Nodes */}
                {coords.map((coord, idx) => (
                  <g key={idx}>
                    <circle cx={coord.x} cy={coord.y} r="5" fill="#8b5cf6" stroke="#0b0f19" strokeWidth="2" />
                    <text x={coord.x} y={coord.y - 10} fill="#f3f4f6" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {coord.percent}%
                    </text>
                    <text x={coord.x} y={lineChartHeight - 8} fill="#6b7280" fontSize="10" textAnchor="middle">
                      {coord.label}
                    </text>
                  </g>
                ))}
                {/* Gradients */}
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>

        {/* SVG Study Duration Bar Chart */}
        <div className="glass-card" style={styles.chartWrapper}>
          <h4 style={styles.chartTitle}>Study Duration Tracker (Hours / Day)</h4>
          <div style={styles.svgContainer}>
            <svg width="100%" height="100%" viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}>
              {/* Horizontal Guide Lines */}
              {[0, 1, 2, 3].map((gridVal) => {
                const y = barChartHeight - padding - (gridVal / 3) * (barChartHeight - padding * 2);
                return (
                  <g key={gridVal}>
                    <line x1={padding} y1={y} x2={barChartWidth - padding} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <text x={padding - 8} y={y + 4} fill="#6b7280" fontSize="10" textAnchor="end">{gridVal}h</text>
                  </g>
                );
              })}
              {/* Bar Columns */}
              {studyData.map((d, index) => {
                const xStep = (barChartWidth - padding * 2) / studyData.length;
                const barWidth = 24;
                const x = padding + index * xStep + (xStep - barWidth) / 2;
                const yHeight = (d.hours / 3) * (barChartHeight - padding * 2);
                const y = barChartHeight - padding - yHeight;

                return (
                  <g key={index}>
                    {/* Rounded top rect path */}
                    <path
                      d={`M ${x} ${y + 4} 
                          Q ${x} ${y} ${x + 4} ${y} 
                          L ${x + barWidth - 4} ${y} 
                          Q ${x + barWidth} ${y} ${x + barWidth} ${y + 4} 
                          L ${x + barWidth} ${barChartHeight - padding} 
                          L ${x} ${barChartHeight - padding} Z`}
                      fill="url(#bar-gradient)"
                    />
                    <text x={x + barWidth / 2} y={y - 8} fill="#f3f4f6" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {d.hours}h
                    </text>
                    <text x={x + barWidth / 2} y={barChartHeight - 8} fill="#6b7280" fontSize="10" textAnchor="middle">
                      {d.date}
                    </text>
                  </g>
                );
              })}
              {/* Gradients */}
              <defs>
                <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>

      {/* Advisory Council Panel (Rule-based recommendations engine panel) */}
      <div className="glass-card" style={styles.advisoryCard}>
        <div style={styles.advisoryHeader}>
          <Lightbulb size={22} color="#f59e0b" />
          <div>
            <h3 style={styles.advisoryTitle}>Rule-Based Learning Advisor</h3>
            <p style={styles.advisorySubtitle}>Real-time recommendations generated using standard statistical score thresholds.</p>
          </div>
        </div>

        <div style={styles.adviceSections}>
          
          {/* Needs Practice Column */}
          <div style={styles.adviceColumn}>
            <div style={{...styles.columnHeader, color: '#f43f5e'}}>
              <AlertTriangle size={16} />
              <span>Needs Practice (&lt; 60%)</span>
            </div>
            <div style={styles.columnBody}>
              {analytics.weakTopics.length === 0 ? (
                <div style={styles.emptyAdvice}>No topics currently score in this bracket! Excellent.</div>
              ) : (
                analytics.weakTopics.map(item => (
                  <div key={item.topicId} style={styles.itemAdviceCard}>
                    <h5 style={styles.adviceTopicName}>{item.name}</h5>
                    <span style={styles.adviceScoreLabel}>Your Score: {item.score}%</span>
                    <ul style={styles.adviceList}>
                      {item.recommendations.map((rec, idx) => (
                        <li key={idx} style={styles.adviceListItem}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Good Standing Column */}
          <div style={styles.adviceColumn}>
            <div style={{...styles.columnHeader, color: '#f59e0b'}}>
              <TrendingUp size={16} />
              <span>Good Standing (60% - 80%)</span>
            </div>
            <div style={styles.columnBody}>
              {analytics.goodTopics.length === 0 ? (
                <div style={styles.emptyAdvice}>No topics currently score in this bracket.</div>
              ) : (
                analytics.goodTopics.map(item => (
                  <div key={item.topicId} style={styles.itemAdviceCard}>
                    <h5 style={styles.adviceTopicName}>{item.name}</h5>
                    <span style={{...styles.adviceScoreLabel, color: '#f59e0b'}}>Your Score: {item.score}%</span>
                    <ul style={styles.adviceList}>
                      {item.recommendations.map((rec, idx) => (
                        <li key={idx} style={styles.adviceListItem}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mastered Column */}
          <div style={styles.adviceColumn}>
            <div style={{...styles.columnHeader, color: '#10b981'}}>
              <CheckCircle size={16} />
              <span>Mastered (&ge; 80%)</span>
            </div>
            <div style={styles.columnBody}>
              {analytics.strongTopics.length === 0 ? (
                <div style={styles.emptyAdvice}>No topics currently score in this bracket. Complete quizzes to unlock.</div>
              ) : (
                analytics.strongTopics.map(item => (
                  <div key={item.topicId} style={styles.itemAdviceCard}>
                    <h5 style={styles.adviceTopicName}>{item.name}</h5>
                    <span style={{...styles.adviceScoreLabel, color: '#10b981'}}>Your Score: {item.score}%</span>
                    <ul style={styles.adviceList}>
                      {item.recommendations.map((rec, idx) => (
                        <li key={idx} style={styles.adviceListItem}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

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
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  metricCard: {
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: '#6b7280',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
    marginTop: '8px',
  },
  metricDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '4px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  chartWrapper: {
    minHeight: '260px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  chartTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
    marginBottom: '1rem',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChart: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textAlign: 'center',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryCard: {
    padding: '2rem',
  },
  advisoryHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '1.25rem',
    marginBottom: '1.5rem',
  },
  advisoryTitle: {
    fontSize: '1.25rem',
    color: '#f3f4f6',
    fontWeight: '700',
    fontFamily: "'Outfit', sans-serif",
  },
  advisorySubtitle: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '2px',
  },
  adviceSections: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  adviceColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  columnBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  emptyAdvice: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px dashed rgba(255,255,255,0.04)',
    color: '#6b7280',
    fontSize: '0.75rem',
    lineHeight: '1.4',
    textAlign: 'center',
  },
  itemAdviceCard: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  adviceTopicName: {
    fontSize: '0.85rem',
    color: '#e5e7eb',
    fontWeight: '600',
  },
  adviceScoreLabel: {
    fontSize: '0.7rem',
    color: '#f43f5e',
    fontWeight: '600',
    display: 'block',
    marginTop: '2px',
  },
  adviceList: {
    paddingLeft: '14px',
    margin: '6px 0 0 0',
  },
  adviceListItem: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    lineHeight: '1.3',
    marginTop: '4px',
  },
};
