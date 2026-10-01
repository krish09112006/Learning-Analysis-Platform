import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, FileText, Download, CheckCircle, HelpCircle, Upload, AlertCircle, RefreshCw, X, BookOpen, Settings, LogOut, User, Folder, FolderOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import quizService from '../services/quizService';
import assignmentService from '../services/assignmentService';
import { SYLLABUS_CATEGORIES } from '../mockData';

export default function Courses({ 
  student, 
  course, 
  onMarkTopicCompleted, 
  onQuizAttempt, 
  onAssignmentSubmit, 
  logActivity,
  selectedTopicId,
  setSelectedTopicId,
  onLogout,
  onResetProgress,
  onLeaveCourse,
  setActivePage
}) {
  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' or 'quiz'
  const [activeQuiz, setActiveQuiz] = useState(null); // quiz data
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionId: selectedIndex }
  const [submittingFile, setSubmittingFile] = useState({}); // { topicId: filename }

  // Settings dropdown state
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Dynamically compute syllabus categories / modules from course
  const availableCategories = React.useMemo(() => {
    if (course?.modules && course.modules.length > 0) {
      return course.modules.map(m => m.title || m.module_name || m.name);
    }
    const topicCats = Array.from(new Set((course?.topics || []).map(t => t.category))).filter(Boolean);
    if (topicCats.length > 0) return topicCats;
    return SYLLABUS_CATEGORIES;
  }, [course]);

  // Folder Collapsed/Expanded states
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const states = {};
    const cats = course?.modules?.map(m => m.title || m.module_name || m.name) || 
      Array.from(new Set((course?.topics || []).map(t => t.category))).filter(Boolean);
    const finalCats = cats.length > 0 ? cats : SYLLABUS_CATEGORIES;
    finalCats.forEach((cat, index) => {
      // By default, expand only the first module and collapse the rest to keep it neat
      states[cat] = index === 0;
    });
    return states;
  });

  // Toggle Folder Collapsing
  const toggleCategory = (catName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Find active topic object
  const activeTopic = course.topics.find(t => t.id === selectedTopicId) || course.topics[0] || null;

  const [topicAssignments, setTopicAssignments] = React.useState([]);

  React.useEffect(() => {
    if (activeTopic && student) {
      assignmentService.getAssignments(course.id, activeTopic.id)
        .then(res => setTopicAssignments(res.filter(a => a.status === 'Published')))
        .catch(err => console.error("Failed to load assignments", err));
    }
  }, [activeTopic, student, course.id]);

  // Trigger Material Download
  const handleDownload = (material, topicName) => {
    logActivity(`Downloaded material: "${material.title}" for topic ${topicName}`);
    if (!activeTopic) return;

    // We will build the PDF stream directly!
    let stream = 'BT\n';
    
    // Draw Top Banner (solid sky-blue `#0284C7`)
    let graphics = '0.02 0.52 0.82 rg\n40 2400 532 60 re f\n';
    
    // Brand Text (white on banner)
    stream += '1 1 1 rg\n/F2 9 Tf\n50 2438 Td\n(EduInsight Study Reference Library) Tj\n';
    stream += '0 -22 Td\n/F3 16 Tf\n(COURSE: PYTHON PROGRAMMING) Tj\n';
    
    // Reset cursor coordinate offset
    stream += 'ET\nBT\n';
    
    // Title (Navy blue `#0F172A`)
    stream += '0.06 0.09 0.16 rg\n/F3 20 Tf\n45 2330 Td\n';
    stream += `(${activeTopic.name.toUpperCase()}) Tj\n`;
    stream += 'ET\n';
    
    // Divider line below Title
    graphics += '0.88 0.95 0.99 RG\n1 w\n45 2315 m 572 2315 l S\n';
    
    // Next cursor position
    let y = 2270;
    
    // Helper to print styled sections
    const drawSectionHeader = (title) => {
      // Draw a small blue bullet rectangle
      graphics += `0.02 0.52 0.82 rg\n45 ${y} 6 12 re f\n`;
      // Print Header Text
      stream += `BT\n0.06 0.09 0.16 rg\n/F3 11 Tf\n58 ${y + 2} Td\n(${title}) Tj\nET\n`;
      y -= 25;
    };
    
    const drawTextList = (items, isNumbered = false) => {
      stream += 'BT\n0.12 0.16 0.23 rg\n/F2 9.5 Tf\n12 TL\n';
      stream += `55 ${y} Td\n`;
      items.forEach((item, index) => {
        const text = isNumbered ? `${index + 1}. ${item}` : `* ${item}`;
        const escaped = text.replace(/[()]/g, '\\$&');
        stream += `(${escaped}) Tj T*\n`;
        y -= 12;
      });
      stream += 'ET\n';
      y -= 15;
    };
    
    const drawParagraph = (text) => {
      // Split paragraph by newlines
      const lines = text.split('\n');
      stream += 'BT\n0.12 0.16 0.23 rg\n/F2 9.5 Tf\n14 TL\n';
      stream += `55 ${y} Td\n`;
      lines.forEach(line => {
        const escaped = line.replace(/[()]/g, '\\$&');
        stream += `(${escaped}) Tj T*\n`;
        y -= 14;
      });
      stream += 'ET\n';
      y -= 15;
    };
    
    const drawCodeBlock = (syntax, example, output) => {
      // Determine how tall the box needs to be
      const codeLines = [];
      if (syntax) codeLines.push(...syntax.split('\n'));
      if (example) codeLines.push(...example.split('\n'));
      if (output) {
        codeLines.push('[Expected Output]:');
        codeLines.push(...output.split('\n'));
      }
      
      const boxHeight = (codeLines.length * 12) + 20;
      y -= boxHeight;
      
      // Draw background gray box
      graphics += `0.97 0.98 0.98 rg\n45 ${y} 522 ${boxHeight} re f\n`;
      // Draw border
      graphics += `0.88 0.95 0.99 RG\n0.5 w\n45 ${y} 522 ${boxHeight} re S\n`;
      
      // Print code text inside Courier font
      stream += `BT\n0.2 0.2 0.2 rg\n/F1 9 Tf\n12 TL\n55 ${y + boxHeight - 15} Td\n`;
      codeLines.forEach(line => {
        const escaped = line.replace(/[()]/g, '\\$&');
        stream += `(${escaped}) Tj T*\n`;
      });
      stream += 'ET\n';
      y -= 20;
    };

    // 1. Objectives Section
    if (activeTopic.learningObjectives && activeTopic.learningObjectives.length > 0) {
      drawSectionHeader('LEARNING OBJECTIVES');
      drawTextList(activeTopic.learningObjectives, true);
    }
    
    // 2. Concept Section
    if (activeTopic.conceptExplanation) {
      drawSectionHeader('CONCEPT EXPLANATION');
      drawParagraph(activeTopic.conceptExplanation);
    }
    
    // 3. Syntax & Examples Section
    if (activeTopic.syntax || activeTopic.example) {
      drawSectionHeader('CODE SYNTAX & EXAMPLES');
      drawCodeBlock(activeTopic.syntax, activeTopic.example, activeTopic.output);
    }
    
    // 4. Key Takeaways Section
    if (activeTopic.keyPoints && activeTopic.keyPoints.length > 0) {
      drawSectionHeader('KEY TAKEAWAYS');
      drawTextList(activeTopic.keyPoints, false);
    }
    
    // 5. Common Mistakes
    if (activeTopic.commonMistakes && activeTopic.commonMistakes.length > 0) {
      drawSectionHeader('COMMON MISTAKES TO AVOID');
      drawTextList(activeTopic.commonMistakes, false);
    }
    
    // Footer watermark
    graphics += '0.88 0.95 0.99 RG\n1 w\n45 60 m 572 60 l S\n';
    stream += `BT\n0.5 0.5 0.5 rg\n/F2 8 Tf\n45 45 Td\n(Generated by EduInsight - Academic Analytics Tracking Portal) Tj\nET\n`;
    
    // Combine graphics operations and text operations
    const fullStream = `${graphics}\n${stream}`;
    const streamLength = fullStream.length;
    
    const pdfData = [
      '%PDF-1.4\n',
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 5 0 R /MediaBox [0 0 612 2500] >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n',
      `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${fullStream}\nendstream\nendobj\n`,
      '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
      '7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
      'xref\n0 8\n0000000000 65535 f \n',
      'trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n120\n%%EOF'
    ].join('');

    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    
    const downloadName = material.title.endsWith('.pdf') 
      ? material.title 
      : `${material.title.replace(/\s+/g, '_')}.pdf`;
      
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Assignment Submission
  const handleFileChange = (e, assnId) => {
    const file = e.target.files[0];
    if (file) {
      setSubmittingFile(prev => ({ ...prev, [assnId]: file.name }));
    }
  };

  const submitLiveAssignment = async (assnId) => {
    const filename = submittingFile[assnId];
    if (!filename) return alert("Please select a file first.");
    
    try {
      await assignmentService.submitAssignment({
        assignment_id: assnId,
        student_id: student.user_id,
        file_name: filename,
        submission_text: ''
      });
      logActivity(`Submitted file for assignment ID: ${assnId} (File: ${filename})`);
      
      setSubmittingFile(prev => {
        const copy = { ...prev };
        delete copy[assnId];
        return copy;
      });
      
      alert(`✅ Assignment Submitted: "${filename}" uploaded successfully.`);
    } catch (err) {
      alert("Submission failed: " + err.message);
    }
  };

  // Start Quiz Taker
  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setActiveTab('quiz');
    logActivity(`Started Quiz: ${quiz.title}`);
  };

  // Submit Quiz Answers
  const submitQuiz = async () => {
    const questions = activeQuiz.questions;
    try {
      const data = await quizService.submitQuiz(student.user_id, activeQuiz.id, quizAnswers);
      
      onQuizAttempt(activeQuiz.id, data.score, questions.length);
      logActivity(`Completed Quiz: ${activeQuiz.title} (Score: ${data.score}/${questions.length} - ${data.percentage}%)`);
      
      setActiveTab('syllabus');
      setActiveQuiz(null);
      
      // Alert user about rule-based feedback
      let feedback = "";
      if (data.percentage < 60) {
        feedback = `❌ Score: ${data.percentage}% (Needs Practice). Review the module materials.`;
      } else if (data.percentage >= 60 && data.percentage < 80) {
        feedback = `⚠️ Score: ${data.percentage}% (Good). Re-read concepts to master it.`;
      } else {
        feedback = `🎉 Score: ${data.percentage}% (Strong). Brilliant execution!`;
      }
      
      let reviewMessage = `📊 Quiz Submitted!\n\n${feedback}\n\nReview Explanations:\n`;
      questions.forEach((q, idx) => {
        const isCorrect = quizAnswers[idx] === q.correctAnswer;
        reviewMessage += `\nQ${idx + 1}: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}\n`;
      });
      alert(reviewMessage);
    } catch (e) {
      alert("Failed to submit quiz: " + e.message);
    }
  };

  // Navigate Previous Topic
  const handlePrevTopic = () => {
    if (!activeTopic) return;
    const currentIndex = course.topics.findIndex(t => t.id === activeTopic.id);
    if (currentIndex > 0) {
      setSelectedTopicId(course.topics[currentIndex - 1].id);
    }
  };

  // Navigate Next Topic
  const handleNextTopic = () => {
    if (!activeTopic) return;
    const currentIndex = course.topics.findIndex(t => t.id === activeTopic.id);
    if (currentIndex < course.topics.length - 1) {
      setSelectedTopicId(course.topics[currentIndex + 1].id);
    }
  };

  // Check if adjacent topics exist for rendering previous/next buttons
  const hasPrev = activeTopic ? course.topics.findIndex(t => t.id === activeTopic.id) > 0 : false;
  const hasNext = activeTopic ? course.topics.findIndex(t => t.id === activeTopic.id) < course.topics.length - 1 : false;

  // Compute progress percent for indicators
  const progressPercent = course.topics.length > 0
    ? Math.round((student.completedTopics.length / course.topics.length) * 100)
    : 0;

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {activeTab === 'syllabus' ? (
        <>
          {/* Syllabus Header */}
          <div style={styles.courseHeader}>
            <div>
              <span style={styles.courseSubtitle}>Active Classroom Workspace</span>
              <h2 style={styles.courseTitle}>{course.title}</h2>
              <p style={styles.courseDesc}>{course.description}</p>
            </div>
            
            <div style={styles.headerRightArea}>
              <div style={styles.headerActionsRow}>
                {/* Settings Dropdown Trigger */}
                <div style={styles.settingsWrapper}>
                  <button 
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)} 
                    style={styles.settingsBtn}
                    title="Workspace Settings"
                  >
                    <Settings size={18} /> Settings
                  </button>
                  
                  {showSettingsDropdown && (
                    <div style={styles.settingsDropdown}>
                      <div style={styles.settingsDropdownHeader}>Workspace Options</div>
                      <div style={styles.settingsDropdownList}>
                        <button 
                          onClick={() => {
                            setShowSettingsDropdown(false);
                            setActivePage('profile');
                          }}
                          style={styles.dropdownOption}
                        >
                          <User size={14} /> Profile Settings
                        </button>
                        <button 
                          onClick={() => {
                            setShowSettingsDropdown(false);
                            if (window.confirm("Return to Course Catalog?")) {
                              onLeaveCourse();
                            }
                          }}
                          style={styles.dropdownOption}
                        >
                          <BookOpen size={14} /> Browse Catalog
                        </button>
                        <button 
                          onClick={() => {
                            setShowSettingsDropdown(false);
                            onResetProgress();
                          }}
                          style={{...styles.dropdownOption, color: '#f59e0b'}}
                        >
                          <RefreshCw size={14} color="#f59e0b" /> Reset Progress
                        </button>
                        <div style={styles.dropdownDivider} />
                        <button 
                          onClick={() => {
                            setShowSettingsDropdown(false);
                            onLogout();
                          }}
                          style={{...styles.dropdownOption, color: '#f43f5e'}}
                        >
                          <LogOut size={14} color="#f43f5e" /> Sign Out (Logout)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={styles.courseMetaBox}>
                <span style={styles.metaLabel}>Language: <strong>English</strong></span>
              </div>
            </div>
          </div>

          {/* Split Pane Classroom Layout */}
          <div style={styles.splitWorkspace}>
            
            {/* Left Pane: Collapsible Categories Syllabus Tree */}
            <div className="glass-card" style={styles.treeSidebar}>
              <div style={styles.treeHeader}>
                <BookOpen size={16} color="#8b5cf6" />
                <span style={styles.treeHeaderTitle}>Syllabus Outline</span>
              </div>
              
              <div style={styles.categoryList}>
                {availableCategories.map((cat, catIdx) => {
                  const isExpanded = expandedCategories[cat];
                  const topicsInCat = (course.topics || []).filter(t => t.category === cat || t.category === `Module ${catIdx + 1}: ${cat}` || cat.includes(t.category));
                  
                  return (
                    <div key={cat} style={styles.categoryBlock}>
                      {/* Category Title Row */}
                      <div style={styles.categoryHeader}>
                        <div onClick={() => toggleCategory(cat)} style={styles.categoryTitleGroup}>
                          {isExpanded ? (
                            <FolderOpen size={15} color="#8b5cf6" style={{ marginRight: '6px' }} />
                          ) : (
                            <Folder size={15} color="#6b7280" style={{ marginRight: '6px' }} />
                          )}
                          <span style={isExpanded ? styles.catNameExpanded : styles.catNameCollapsed}>
                            {cat}
                          </span>
                          <span style={styles.nodeCountBadge}>{topicsInCat.length}</span>
                        </div>
                      </div>

                      {/* Nested Topics List */}
                      {isExpanded && (
                        <div style={styles.topicNodeList}>
                          {topicsInCat.length === 0 ? (
                            <div style={styles.emptyCatPlaceholder}>
                              No topics preloaded.
                            </div>
                          ) : (
                            <>
                              {topicsInCat.map(topic => {
                                const isActive = selectedTopicId === topic.id;
                                const isCompleted = student.completedTopics.includes(topic.id);
                                
                                return (
                                  <div 
                                    key={topic.id}
                                    onClick={() => setSelectedTopicId(topic.id)}
                                    style={{
                                      ...styles.topicNodeRow,
                                      backgroundColor: isActive ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                                      borderColor: isActive ? 'var(--primary)' : 'transparent',
                                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                                    }}
                                  >
                                    <div style={styles.topicNodeLeft}>
                                      <span style={styles.nodeBullet}>•</span>
                                      <span style={{
                                        ...styles.nodeName,
                                        textDecoration: 'none',
                                        opacity: 1
                                      }}>
                                        {topic.name}
                                      </span>
                                    </div>
                                    {isCompleted && (
                                      <CheckCircle size={12} color="#10b981" style={{ flexShrink: 0 }} />
                                    )}
                                  </div>
                                );
                              })}
                              
                              {/* Module practice quiz at the end of module subtopics */}
                              {(() => {
                                const catModuleId = catIdx + 1;
                                const moduleQuiz = course.quizzes ? course.quizzes.find(q => q.module_id === catModuleId || q.id === `q-mod-${catModuleId}` || (q.title && q.title.toLowerCase().includes(cat.toLowerCase()))) : null;
                                if (!moduleQuiz || !moduleQuiz.questions || moduleQuiz.questions.length === 0) return null;
                                const quizAttempt = student.quizAttempts.find(a => a.quizId === moduleQuiz.id);
                                const isQuizActive = activeQuiz?.id === moduleQuiz.id;
 
                                return (
                                  <div 
                                    onClick={() => startQuiz(moduleQuiz)}
                                    style={{
                                      ...styles.topicNodeRow,
                                      backgroundColor: isQuizActive ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                                      borderColor: isQuizActive ? 'var(--primary)' : 'transparent',
                                      color: isQuizActive ? 'var(--primary)' : 'var(--primary)',
                                      fontWeight: '600',
                                      marginTop: '4px',
                                      borderTop: '1px dashed rgba(var(--primary-rgb), 0.15)'
                                    }}
                                  >
                                    <div style={styles.topicNodeLeft}>
                                      <span style={{ fontSize: '0.8rem', marginRight: '2px' }}>🧠</span>
                                      <span style={styles.nodeName}>
                                        Practice Quiz
                                      </span>
                                    </div>
                                    {quizAttempt ? (
                                      <span style={{
                                        fontSize: '0.65rem',
                                        color: '#10b981',
                                        backgroundColor: 'rgba(16,185,129,0.06)',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold'
                                      }}>
                                        {quizAttempt.percent}%
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{moduleQuiz.questions.length} Qs</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Comprehensive Final Assessment */}
                {(() => {
                  const finalAssessmentQuiz = course.quizzes?.find(q => q.is_final_assessment || q.module_id === 999 || (q.title && q.title.toLowerCase().includes('final assessment')));
                  if (!finalAssessmentQuiz || !finalAssessmentQuiz.questions || finalAssessmentQuiz.questions.length === 0) return null;
                  const finalAttempt = student.quizAttempts.find(a => a.quizId === finalAssessmentQuiz.id);
                  const isFinalActive = activeQuiz?.id === finalAssessmentQuiz.id;

                  return (
                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      <div 
                        onClick={() => startQuiz(finalAssessmentQuiz)}
                        style={{
                          ...styles.topicNodeRow,
                          backgroundColor: isFinalActive ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.05)',
                          borderColor: isFinalActive ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
                          color: '#f59e0b',
                          fontWeight: '700',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>🎓</span>
                          <span style={{ fontSize: '0.85rem' }}>Course Final Assessment</span>
                        </div>
                        {finalAttempt ? (
                          <span style={{
                            fontSize: '0.72rem',
                            color: '#10b981',
                            backgroundColor: 'rgba(16,185,129,0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            Score: {finalAttempt.percent}%
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {finalAssessmentQuiz.questions.length} Questions
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Pane: Lesson Workspace Reader */}
            <div className="glass-card" style={styles.workspaceReader}>
              {activeTopic ? (
                /* Interactive Reading & Testing Workspace */
                <div style={styles.lessonPane}>
                  
                  {/* Category breadcrumb */}
                  <div style={styles.readerMetaRow}>
                    <span style={styles.readerCategory}>{activeTopic.category}</span>
                    <span style={styles.readerProgressText}>Course Progress: <strong>{progressPercent}%</strong></span>
                  </div>

                  {/* Topic Metadata Badges: Difficulty, Time, Prerequisites */}
                  <div style={styles.topicMetaBadgesRow}>
                    <span style={{...styles.metaBadge, backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)'}}>
                      ⏱️ {activeTopic.estimatedTime || "15 mins"}
                    </span>
                    <span style={{
                      ...styles.metaBadge,
                      backgroundColor: activeTopic.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.08)' : activeTopic.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                      color: activeTopic.difficulty === 'Easy' ? '#10b981' : activeTopic.difficulty === 'Medium' ? '#f59e0b' : '#f43f5e',
                      borderColor: activeTopic.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : activeTopic.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    }}>
                      ⚡ {activeTopic.difficulty || "Easy"}
                    </span>

                  </div>
                  
                  <div style={styles.readerHeaderRow}>
                    <h3 style={styles.readerTitle}>{activeTopic.name}</h3>
                    <button 
                      onClick={() => onMarkTopicCompleted(activeTopic.id)}
                      style={{
                        ...styles.toggleCompleteBtn,
                        backgroundColor: student.completedTopics.includes(activeTopic.id) ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.06)',
                        color: student.completedTopics.includes(activeTopic.id) ? '#10b981' : '#6366f1',
                        borderColor: student.completedTopics.includes(activeTopic.id) ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.2)'
                      }}
                    >
                      <CheckCircle size={14} />
                      {student.completedTopics.includes(activeTopic.id) ? 'Completed' : 'Mark as Complete'}
                    </button>
                  </div>

                  <div style={styles.readerScrollContainer}>
                    
                    {/* Objectives Panel */}
                    <div style={styles.objectivesBlock}>
                      <h4 style={styles.sectionHeader}>Learning Objectives</h4>
                      <ul style={styles.objectivesList}>
                        {activeTopic.learningObjectives && activeTopic.learningObjectives.map((obj, idx) => (
                          <li key={idx} style={styles.objectiveItem}>
                            <span style={styles.checkBullet}>✓</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Concept Explanation */}
                    <div style={styles.contentSection}>
                      <h4 style={styles.sectionHeader}>Concept</h4>
                      <p style={styles.explanationText}>{activeTopic.conceptExplanation}</p>
                    </div>

                    {/* Syntax box */}
                    {activeTopic.syntax && (
                      <div style={styles.contentSection}>
                        <h4 style={styles.sectionHeader}>Syntax</h4>
                        <pre style={styles.consoleBox}>{activeTopic.syntax}</pre>
                      </div>
                    )}

                    {/* Code Example */}
                    {activeTopic.example && (
                      <div style={styles.contentSection}>
                        <h4 style={styles.sectionHeader}>Example</h4>
                        <pre style={styles.codeBox}>{activeTopic.example}</pre>
                      </div>
                    )}

                    {/* Expected Console Output */}
                    {activeTopic.output && (
                      <div style={styles.contentSection}>
                        <h4 style={styles.sectionHeader}>Expected Output</h4>
                        <pre style={styles.consoleBox}>{activeTopic.output}</pre>
                      </div>
                    )}

                    {/* Key Points */}
                    {activeTopic.keyPoints && (
                      <div style={styles.contentSection}>
                        <h4 style={styles.sectionHeader}>Key Points</h4>
                        <ul style={styles.keyPointsList}>
                          {activeTopic.keyPoints.map((point, idx) => (
                            <li key={idx} style={styles.keyPointItem}>
                              <span style={styles.bulletDot}>•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {activeTopic.commonMistakes && activeTopic.commonMistakes.length > 0 && (
                      <div style={styles.mistakesBlock}>
                        <h4 style={styles.mistakesHeader}>⚠️ Common Mistakes</h4>
                        <ul style={styles.mistakesList}>
                          {activeTopic.commonMistakes.map((mistake, idx) => (
                            <li key={idx} style={styles.mistakeItem}>
                              <span style={styles.mistakeBullet}>✗</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}



                    <div style={styles.sectionDivider} />

                    {/* Interactive Widgets row (Notes, reference materials only) */}
                    <div style={{ ...styles.interactiveGrid, gridTemplateColumns: '1fr' }}>
                      
                      {/* Box 1: Resources & PDFs */}
                      <div style={styles.interactiveBox}>
                        <span style={styles.boxTag}>Course Resources</span>
                        <h5 style={styles.boxTitle}>Reference Materials</h5>
                        <div style={styles.boxBtnList}>
                          {activeTopic.materials && activeTopic.materials.map(mat => (
                            <div key={mat.id} style={styles.materialListItem}>
                              {mat.type === 'pdf' ? (
                                <button 
                                  onClick={() => handleDownload(mat, activeTopic.name)}
                                  style={styles.boxDownloadLink}
                                >
                                  <FileText size={14} color="#6366f1" />
                                  <span>{mat.title}</span>
                                </button>
                              ) : (
                                <span style={styles.videoStatusTag}>📹 Video: Coming Soon</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Box 2: Assignments */}
                      {topicAssignments.length > 0 && (
                        <div style={styles.interactiveBox}>
                          <span style={styles.boxTag} style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>Assignments</span>
                          <h5 style={styles.boxTitle}>Required Submissions</h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            {topicAssignments.map(assn => (
                              <div key={assn.assignment_id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                  <div>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{assn.title}</strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {assn.due_at || 'No Deadline'} | Marks: {assn.max_marks}</span>
                                  </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{assn.description}</p>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <label style={{ flex: 1, cursor: 'pointer' }}>
                                    <input 
                                      type="file" 
                                      style={{ display: 'none' }} 
                                      onChange={(e) => handleFileChange(e, assn.assignment_id)} 
                                    />
                                    <div style={{ padding: '8px 12px', border: '1px dashed var(--primary)', borderRadius: '6px', textAlign: 'center', color: 'var(--primary)', fontSize: '0.85rem' }}>
                                      {submittingFile[assn.assignment_id] || "Choose file to upload..."}
                                    </div>
                                  </label>
                                  <button 
                                    onClick={() => submitLiveAssignment(assn.assignment_id)}
                                    style={{ padding: '8px 16px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Previous / Next Topic anchors */}
                  <div style={styles.navigatorRow}>
                    <button 
                      onClick={handlePrevTopic} 
                      disabled={!hasPrev}
                      style={{
                        ...styles.navAnchorBtn,
                        opacity: hasPrev ? 1 : 0.4,
                        cursor: hasPrev ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <ArrowLeft size={15} /> Previous Topic
                    </button>
                    <button 
                      onClick={handleNextTopic} 
                      disabled={!hasNext}
                      style={{
                        ...styles.navAnchorBtn,
                        opacity: hasNext ? 1 : 0.4,
                        cursor: hasNext ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Next Topic <ArrowRight size={15} />
                    </button>
                  </div>

                </div>
              ) : (
                /* Welcome / Landing State */
                <div style={styles.emptyReaderPane}>
                  <BookOpen size={48} color="#6b7280" style={{ marginBottom: '1.25rem', opacity: 0.5 }} />
                  <h4 style={styles.emptyReaderTitle}>Workspace Active</h4>
                  <p style={styles.emptyReaderDesc}>
                    Please select a topic node from the syllabus folder structure on the left to start learning notes, checking programming examples, downloading PDFs, and attempting your practice evaluations.
                  </p>
                </div>
              )}
            </div>

          </div>
        </>
      ) : (
        /* Quiz Interface Mode (scrollable test) */
        <div className="glass-card animate-fade-in" style={styles.quizTaker}>
          <div style={styles.quizTakerHeader}>
            <div>
              <span style={styles.quizTakerTopic}>Practice Quiz Evaluation ({activeQuiz.questions.length} Questions)</span>
              <h3 style={styles.quizTakerTitle}>{activeQuiz.title}</h3>
            </div>
            <button 
              onClick={() => {
                setActiveTab('syllabus');
                setActiveQuiz(null);
              }} 
              style={styles.cancelQuizBtn}
            >
              <X size={18} /> Cancel Quiz
            </button>
          </div>

          <div style={styles.questionList}>
            {activeQuiz.questions.map((q, idx) => (
              <div key={q.id} style={styles.questionCard}>
                <div style={styles.questionCardHeader}>
                  <h4 style={styles.questionText}>{idx + 1}. {q.question}</h4>
                  <span style={styles.difficultyBadge}>{q.difficulty} | {q.marks} Mark(s)</span>
                </div>
                <div style={styles.optionsList}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[idx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                        style={{
                          ...styles.optionBtn,
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-secondary)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                        }}
                      >
                        <span style={{
                          ...styles.optionLetter,
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                        }}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.quizTakerFooter}>
            <span style={styles.answeredCount}>
              Answered {Object.keys(quizAnswers).length} of {activeQuiz.questions.length} questions
            </span>
            <button 
              onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
              style={{
                ...styles.submitQuizBtn,
                opacity: Object.keys(quizAnswers).length < activeQuiz.questions.length ? 0.5 : 1,
                cursor: Object.keys(quizAnswers).length < activeQuiz.questions.length ? 'not-allowed' : 'pointer',
              }}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
    borderRadius: '12px',
  },
  courseSubtitle: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: 'var(--primary)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  courseTitle: {
    fontSize: '1.4rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
    marginTop: '4px',
    fontFamily: "'Outfit', sans-serif",
  },
  courseDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    maxWidth: '650px',
    lineHeight: '1.4',
  },
  headerRightArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    minWidth: '220px',
  },
  headerActionsRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  settingsWrapper: {
    position: 'relative',
  },
  settingsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  settingsDropdown: {
    position: 'absolute',
    top: '36px',
    right: '0',
    width: '180px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    zIndex: 100,
    overflow: 'hidden',
  },
  settingsDropdownHeader: {
    padding: '6px 10px',
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-color)',
  },
  settingsDropdownList: {
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 10px',
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    textAlign: 'left',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '3px 0',
  },
  courseMetaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    borderLeft: '2px solid var(--border-color)',
    paddingLeft: '10px',
    width: '100%',
    textAlign: 'left',
  },
  metaLabel: {
    display: 'block',
  },
 
  /* Split Pane Layout */
  splitWorkspace: {
    display: 'flex',
    gap: '20px',
    minHeight: '520px',
  },
  treeSidebar: {
    width: '280px',
    flexShrink: 0,
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  treeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  treeHeaderTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    maxHeight: '480px',
    paddingRight: '4px',
  },
  categoryBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
  },
  categoryTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexGrow: 1,
    minWidth: 0,
    userSelect: 'none',
  },
  catNameExpanded: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  catNameCollapsed: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nodeCountBadge: {
    fontSize: '0.65rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    padding: '1px 5px',
    borderRadius: '8px',
    marginLeft: '6px',
    fontWeight: '700',
  },
  topicNodeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '14px',
    marginTop: '4px',
    borderLeft: '1px dashed var(--border-color)',
  },
  emptyCatPlaceholder: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    padding: '6px 8px',
    fontStyle: 'italic',
  },
  topicNodeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: '1px solid transparent',
  },
  topicNodeLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: 0,
  },
  nodeBullet: {
    color: 'var(--primary)',
    fontSize: '0.9rem',
    lineHeight: 1,
  },
  nodeName: {
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
 
  /* Right Pane Workspace */
  workspaceReader: {
    flexGrow: 1,
    minWidth: 0,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  lessonPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  readerMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  readerCategory: {
    fontSize: '0.68rem',
    color: 'var(--primary)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  readerProgressText: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  readerHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    marginBottom: '1rem',
  },
  readerTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontFamily: "'Outfit', sans-serif",
  },
  toggleCompleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1px solid',
    cursor: 'pointer',
    background: 'none',
  },
  readerScrollContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    maxHeight: '380px',
    paddingRight: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.04em',
    marginBottom: '6px',
  },
  objectivesBlock: {
    backgroundColor: 'rgba(var(--primary-rgb), 0.02)',
    border: '1px solid var(--border-color)',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  objectivesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  objectiveItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  checkBullet: {
    color: '#10b981',
    fontWeight: '700',
  },
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  explanationText: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  consoleBox: {
    backgroundColor: '#070a13',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#e5e7eb',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.72rem',
    whiteSpace: 'pre-wrap',
  },
  codeBox: {
    backgroundColor: '#070a13',
    border: '1px solid rgba(99, 102, 241, 0.08)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#34d399',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    whiteSpace: 'pre-wrap',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
  },
  keyPointsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '4px',
  },
  keyPointItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  bulletDot: {
    color: 'var(--primary)',
    fontWeight: '700',
  },
  practiceBlock: {
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid var(--warning-border)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  practiceHeader: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: '#f59e0b',
    fontWeight: '700',
    letterSpacing: '0.04em',
    marginBottom: '4px',
  },
  practiceText: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  sectionDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '8px 0',
  },
  interactiveGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  interactiveBox: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
  },
  boxTag: {
    fontSize: '0.62rem',
    color: 'var(--primary)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  boxTitle: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    margin: '2px 0 8px 0',
  },
  boxBtnList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  materialListItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  boxDownloadLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '6px 8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    textAlign: 'left',
    cursor: 'pointer',
    background: 'none',
  },
  videoStatusTag: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    padding: '6px 8px',
    fontStyle: 'italic',
  },
  boxActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '8px',
    backgroundColor: 'rgba(var(--primary-rgb), 0.08)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--primary)',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  boxUploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '8px',
    backgroundColor: 'rgba(var(--primary-rgb), 0.04)',
    border: '1px dashed var(--border-color)',
    borderRadius: '6px',
    color: 'var(--primary)',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  boxSubmitFileBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px',
    fontSize: '0.68rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '2px',
  },
  boxSubStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '8px',
    backgroundColor: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    borderRadius: '6px',
    color: 'var(--success)',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
  navigatorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px',
    marginTop: '14px',
  },
  navAnchorBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: '600',
  },

  /* Empty Right Pane */
  emptyReaderPane: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flexGrow: 1,
    padding: '2rem',
  },
  emptyReaderTitle: {
    fontSize: '1.05rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    marginTop: '8px',
  },
  emptyReaderDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    maxWidth: '380px',
    lineHeight: '1.4',
    marginTop: '6px',
  },
 
  /* Quiz Taker (Scrollable list with descriptions) */
  quizTaker: {
    padding: '1.5rem',
  },
  quizTakerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginBottom: '1.25rem',
  },
  quizTakerTopic: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: 'var(--primary)',
    fontWeight: '700',
    letterSpacing: '0.04em',
  },
  quizTakerTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontFamily: "'Outfit', sans-serif",
  },
  cancelQuizBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    borderRadius: '6px',
    color: 'var(--danger)',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'none',
  },
  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  questionCard: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '1rem',
    borderRadius: '8px',
  },
  questionCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '8px',
  },
  questionText: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    flexGrow: 1,
    whiteSpace: 'pre-wrap',
  },
  difficultyBadge: {
    fontSize: '0.62rem',
    color: 'var(--primary)',
    backgroundColor: 'rgba(var(--primary-rgb), 0.08)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
    flexShrink: 0,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    border: '1px solid',
    borderRadius: '6px',
    textAlign: 'left',
    fontSize: '0.78rem',
    cursor: 'pointer',
    background: 'none',
  },
  optionLetter: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '700',
  },
  quizTakerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    marginTop: '1.25rem',
  },
  answeredCount: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  submitQuizBtn: {
    padding: '8px 16px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '600',
    boxShadow: '0 0 10px rgba(var(--primary-rgb),0.2)',
    cursor: 'pointer',
  },
  topicMetaBadgesRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  metaBadge: {
    fontSize: '0.68rem',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid',
  },
  mistakesBlock: {
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  mistakesHeader: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: 'var(--danger)',
    fontWeight: '700',
    letterSpacing: '0.04em',
    marginBottom: '6px',
  },
  mistakesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  mistakeItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  mistakeBullet: {
    color: 'var(--danger)',
    fontWeight: '700',
  },
};
