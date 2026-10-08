import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Layers, BookOpen, Clock, Target, 
  Settings, CheckSquare, Image as ImageIcon, Sparkles, Plus, Trash2, X
} from 'lucide-react';

export default function CourseCreationWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // PART 1
    courseTitle: '',
    courseCode: '',
    courseCategory: '',
    subject: '',
    creationMethod: 'smart', // 'manual' or 'smart'
    smartDescription: '',
    smartTopics: [],
    uploadedMaterials: [],
    creationSource: 'description', // 'description', 'materials', 'both'
    
    // PART 2
    targetAudience: 'University Students',
    customAudience: '',
    prerequisites: [],
    primaryObjective: '',
    learningOutcomes: [],
    
    // PART 3
    numModules: '5',
    customModules: '',
    duration: 'Weeks',
    durationValue: '6', // e.g. 6 Weeks
    hoursPerWeek: '4',
    difficulty: 'Beginner',
    contentDepth: 'Standard',
    
    // PART 4
    modulePlanningMethod: 'topics', // 'names' or 'topics'
    moduleTopicsText: '',
    modules: [],
    
    // PART 5
    contentTypes: {
      topicExplanations: true,
      examples: true,
      practicalActivities: true,
      learningMaterials: true,
      moduleQuizzes: true,
      codeExamples: false,
      practiceQuestions: false,
      assignments: false,
      finalAssessment: false
    },
    
    // PART 6
    isProgramming: false,
    programmingLanguages: [],
    
    // PART 7
    quizQuestionsPerModule: '5',
    quizCustomQuestions: '',
    quizDifficulty: 'Same as module',
    quizTypes: {
      mcq: true,
      msq: false,
      tf: false,
      fitb: false,
      predictOutput: false,
      findError: false,
      completeCode: false,
      chooseCorrect: false
    },
    quizTotalMarks: '100',
    quizPassingMarks: '60',
    quizTimeLimit: '30',
    
    // PART 9
    learningMaterials: {
      pdf: true, notes: true, ppt: false, docx: false, images: true, externalLinks: false, codeFiles: false, referenceMaterials: false
    },
    
    // PART 10
    practicalActivities: {
      practiceExercises: true, codingExercises: false, caseStudies: false, discussionTasks: false, miniProjects: false, assignments: false
    }
  });

  const [generating, setGenerating] = useState(false);
  const [progressLog, setProgressLog] = useState([]);

  // Handle derived programming check
  useEffect(() => {
    const isProg = formData.courseCategory.toLowerCase().includes('programming') || 
                   formData.subject.toLowerCase().includes('computer') ||
                   formData.courseTitle.toLowerCase().includes('python') ||
                   formData.courseTitle.toLowerCase().includes('code');
    setFormData(prev => ({ ...prev, isProgramming: isProg }));
  }, [formData.courseCategory, formData.subject, formData.courseTitle]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.courseTitle) {
      alert("Course Title is required.");
      return;
    }
    if (step === 2 && !formData.primaryObjective) {
      alert("Primary Learning Objective is required.");
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleGenerate = async () => {
    setGenerating(true);
    setProgressLog(["Preparing course structure..."]);
    
    const steps = [
      "Organizing modules...",
      "Creating topics...",
      "Preparing learning content...",
      "Creating practical activities...",
      "Preparing programming examples...",
      "Creating module quizzes...",
      "Validating course structure..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setProgressLog(prev => [...prev, steps[i]]);
    }
    
    await new Promise(r => setTimeout(r, 500));
    setGenerating(false);
    onComplete(formData, formData.creationMethod === 'smart');
  };

  // Styles matching the platform's UI
  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    header: { fontSize: '0.85rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', marginBottom: '8px' },
    title: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginTop: 0, marginBottom: '24px' },
    label: { display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', marginBottom: '16px' },
    textarea: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', minHeight: '100px', marginBottom: '16px', fontFamily: 'inherit' },
    select: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', marginBottom: '16px', backgroundColor: '#fff' },
    row: { display: 'flex', gap: '16px', marginBottom: '16px' },
    col: { flex: 1 },
    btnPrimary: { backgroundColor: '#0284c7', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { backgroundColor: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    btnGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' },
    radioCard: (active) => ({ flex: 1, padding: '20px', borderRadius: '10px', border: active ? '2px solid #0284c7' : '1px solid #cbd5e1', backgroundColor: active ? '#f0f9ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }),
    radioTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' },
    radioDesc: { fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5' },
    checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#334155', cursor: 'pointer' },
    chip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '16px', fontSize: '0.85rem', fontWeight: '500', marginRight: '8px', marginBottom: '8px' },
    listInputWrap: { display: 'flex', gap: '8px', marginBottom: '16px' },
    logBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#475569', minHeight: '150px' }
  };

  const renderStepIndicators = () => (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '10px' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: '4px', flex: 1, minWidth: '40px', backgroundColor: i + 1 <= step ? '#0284c7' : '#e2e8f0', borderRadius: '2px' }} />
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      <button onClick={onCancel} style={{ ...styles.btnSecondary, border: 'none', background: 'transparent', padding: '0', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Courses
      </button>

      {renderStepIndicators()}

      <div style={styles.card}>
        
        {/* ==========================================================
            PART 1: HOW DO YOU WANT TO BUILD YOUR COURSE?
        ========================================================== */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div style={styles.header}>PART 1</div>
            <h2 style={styles.title}>How do you want to build your course?</h2>
            
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Course Title *</label>
                <input style={styles.input} placeholder="e.g. Python Programming Fundamentals" value={formData.courseTitle} onChange={e => updateForm('courseTitle', e.target.value)} />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Course Code</label>
                <input style={styles.input} placeholder="e.g. CS101" value={formData.courseCode} onChange={e => updateForm('courseCode', e.target.value)} />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Course Category</label>
                <input style={styles.input} placeholder="e.g. Programming" value={formData.courseCategory} onChange={e => updateForm('courseCategory', e.target.value)} />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Subject</label>
                <input style={styles.input} placeholder="e.g. Computer Science" value={formData.subject} onChange={e => updateForm('subject', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
                <Sparkles size={20} color="#0284c7" />
                <h3 style={{margin:0, fontSize:'1.1rem', color:'#0284c7'}}>Smart Course Builder</h3>
              </div>
              <label style={styles.label}>Describe your course</label>
                <textarea style={styles.textarea} placeholder="Describe what you want students to learn in this course..." value={formData.smartDescription} onChange={e => updateForm('smartDescription', e.target.value)} maxLength={2000} />
                <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right', marginTop: '-12px', marginBottom: '16px' }}>{formData.smartDescription.length} / 2000</div>

                <label style={styles.label}>Important Topics / Concepts</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {formData.smartTopics.map((topic, i) => (
                    <span key={i} style={styles.chip}>
                      {topic} <X size={12} style={{cursor:'pointer'}} onClick={() => updateForm('smartTopics', formData.smartTopics.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
                <div style={styles.listInputWrap}>
                  <input id="newTopic" style={{...styles.input, marginBottom: 0}} placeholder="e.g. Python Basics" onKeyDown={e => {
                    if(e.key === 'Enter') {
                      e.preventDefault();
                      if(e.target.value) { updateForm('smartTopics', [...formData.smartTopics, e.target.value]); e.target.value = ''; }
                    }
                  }} />
                  <button type="button" style={{...styles.btnSecondary, marginBottom: 0}} onClick={() => {
                    const el = document.getElementById('newTopic');
                    if(el.value) { updateForm('smartTopics', [...formData.smartTopics, el.value]); el.value = ''; }
                  }}><Plus size={16}/> Add Topic</button>
                </div>
                
                <hr style={{border:0, borderTop:'1px solid #e2e8f0', margin:'20px 0'}} />
                
                <label style={styles.label}>Upload Supporting Materials (Optional)</label>
                <p style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'12px'}}>Upload existing teaching material to help structure your course. (PDF, DOCX, PPTX, TXT)</p>
                <input type="file" id="wizardFileUpload" style={{ display: 'none' }} multiple onChange={(e) => {
                  if (e.target.files.length > 0) {
                    const fileNames = Array.from(e.target.files).map(f => f.name);
                    updateForm('uploadedMaterials', [...(formData.uploadedMaterials || []), ...fileNames]);
                  }
                }} />
                <div onClick={() => document.getElementById('wizardFileUpload').click()} style={{border:'2px dashed #cbd5e1', padding:'30px', textAlign:'center', borderRadius:'8px', backgroundColor:'#fff', cursor:'pointer'}}>
                  <Plus size={24} color="#94a3b8" style={{margin:'0 auto'}} />
                  <div style={{fontSize:'0.95rem', color:'#64748b', marginTop:'8px'}}>Click to upload files</div>
                  {formData.uploadedMaterials && formData.uploadedMaterials.length > 0 && (
                    <div style={{marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center'}}>
                      {formData.uploadedMaterials.map((file, i) => (
                        <span key={i} style={{...styles.chip, margin: 0, backgroundColor: '#f1f5f9', color: '#475569'}}>{file}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <label style={styles.label} style={{marginTop:'20px'}}>Course Creation Source</label>
                <div style={{display:'flex', gap:'16px'}}>
                  {['Start from my description', 'Start from uploaded materials', 'Use both'].map(src => (
                    <label key={src} style={styles.checkboxLabel}>
                      <input type="radio" checked={formData.creationSource === src} onChange={() => updateForm('creationSource', src)} />
                      {src}
                    </label>
                  ))}
                </div>
              </div>
          </div>
        )}

        {/* ==========================================================
            PART 2: WHO IS THIS COURSE FOR?
        ========================================================== */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={styles.header}>PART 2</div>
            <h2 style={styles.title}>Who is this course for?</h2>
            
            <label style={styles.label}>Target Learners *</label>
            <select style={styles.select} value={formData.targetAudience} onChange={e => updateForm('targetAudience', e.target.value)}>
              <option value="School Students">School Students</option>
              <option value="College Students">College Students</option>
              <option value="University Students">University Students</option>
              <option value="Beginners">Beginners</option>
              <option value="Intermediate Learners">Intermediate Learners</option>
              <option value="Advanced Learners">Advanced Learners</option>
              <option value="Working Professionals">Working Professionals</option>
              <option value="Mixed Audience">Mixed Audience</option>
              <option value="Custom">Custom</option>
            </select>
            {formData.targetAudience === 'Custom' && (
              <input style={styles.input} placeholder="e.g. First-year Computer Engineering students" value={formData.customAudience} onChange={e => updateForm('customAudience', e.target.value)} />
            )}

            <label style={styles.label} style={{marginTop:'20px', ...styles.label}}>What should learners know before starting? (Prerequisites)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {formData.prerequisites.length === 0 && <span style={{fontSize:'0.9rem', color:'#64748b'}}>No prerequisites added.</span>}
              {formData.prerequisites.map((prereq, i) => (
                <span key={i} style={styles.chip}>
                  {prereq} <X size={12} style={{cursor:'pointer'}} onClick={() => updateForm('prerequisites', formData.prerequisites.filter((_, idx) => idx !== i))} />
                </span>
              ))}
            </div>
            <div style={styles.listInputWrap}>
              <input id="newPrereq" style={{...styles.input, marginBottom: 0}} placeholder="e.g. Basic computer knowledge" onKeyDown={e => {
                if(e.key === 'Enter') {
                  e.preventDefault();
                  if(e.target.value) { updateForm('prerequisites', [...formData.prerequisites, e.target.value]); e.target.value = ''; }
                }
              }} />
              <button type="button" style={{...styles.btnSecondary, marginBottom: 0}} onClick={() => {
                const el = document.getElementById('newPrereq');
                if(el.value) { updateForm('prerequisites', [...formData.prerequisites, el.value]); el.value = ''; }
              }}><Plus size={16}/> Add Prerequisite</button>
            </div>

            <label style={styles.label} style={{marginTop:'20px', ...styles.label}}>What should learners be able to DO after completing this course? *</label>
            <textarea style={styles.textarea} placeholder="e.g. Students should be able to write basic Python programs..." value={formData.primaryObjective} onChange={e => updateForm('primaryObjective', e.target.value)} maxLength={2000} />

            <label style={styles.label}>Measurable Learning Outcomes</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {formData.learningOutcomes.map((outcome, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{fontWeight:'bold', color:'#0284c7'}}>{i+1}.</span>
                  <input style={{...styles.input, marginBottom:0, flex:1}} value={outcome} onChange={e => {
                    const newOutcomes = [...formData.learningOutcomes];
                    newOutcomes[i] = e.target.value;
                    updateForm('learningOutcomes', newOutcomes);
                  }} />
                  <Trash2 size={18} color="#ef4444" style={{cursor:'pointer'}} onClick={() => updateForm('learningOutcomes', formData.learningOutcomes.filter((_, idx) => idx !== i))} />
                </div>
              ))}
            </div>
            <button type="button" style={styles.btnSecondary} onClick={() => updateForm('learningOutcomes', [...formData.learningOutcomes, ''])}>
              <Plus size={16}/> Add Learning Outcome
            </button>
          </div>
        )}

        {/* ==========================================================
            PART 3: HOW DO YOU WANT TO STRUCTURE YOUR COURSE?
        ========================================================== */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={styles.header}>PART 3</div>
            <h2 style={styles.title}>How do you want to structure your course?</h2>
            
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Number of Modules *</label>
                <select style={styles.select} value={formData.numModules} onChange={e => updateForm('numModules', e.target.value)}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="Custom">Custom</option>
                </select>
                {formData.numModules === 'Custom' && <input style={styles.input} placeholder="Enter number of modules" type="number" value={formData.customModules} onChange={e => updateForm('customModules', e.target.value)} />}
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Course Duration Type *</label>
                <select style={styles.select} value={formData.duration} onChange={e => updateForm('duration', e.target.value)}>
                  <option value="Self-paced">Self-paced</option>
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                </select>
                {formData.duration !== 'Self-paced' && <input style={styles.input} placeholder={`Number of ${formData.duration.toLowerCase()}`} type="number" value={formData.durationValue} onChange={e => updateForm('durationValue', e.target.value)} />}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Estimated learning time (Hours per week)</label>
                <input style={styles.input} type="number" placeholder="e.g. 4" value={formData.hoursPerWeek} onChange={e => updateForm('hoursPerWeek', e.target.value)} />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Total Estimated Hours</label>
                <div style={{...styles.input, backgroundColor:'#f8fafc', color:'#64748b', display:'flex', alignItems:'center'}}>
                  {(formData.duration !== 'Self-paced' && formData.durationValue && formData.hoursPerWeek) 
                    ? `${parseInt(formData.durationValue) * parseInt(formData.hoursPerWeek)} hours` 
                    : 'Calculated automatically'}
                </div>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Difficulty Level *</label>
                <select style={styles.select} value={formData.difficulty} onChange={e => updateForm('difficulty', e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Content Depth</label>
                <div style={{display:'flex', gap:'12px'}}>
                  {['Basic', 'Standard', 'Detailed'].map(d => (
                    <label key={d} style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'0.9rem', cursor:'pointer'}}>
                      <input type="radio" checked={formData.contentDepth === d} onChange={() => updateForm('contentDepth', d)} /> {d}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            PART 4 & 5: TOPICS & CONTENT TYPES
        ========================================================== */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div style={styles.header}>PART 4 & 5</div>
            <h2 style={styles.title}>What should learners learn?</h2>
            
            <>
              <label style={styles.label}>Module/Topic Guidance for Smart Builder</label>
              <p style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'12px'}}>You can provide specific module names or a list of main topics, and the AI will organize them.</p>
              <textarea style={styles.textarea} placeholder="Module 1: Python Fundamentals&#10;Module 2: Control Flow..." value={formData.moduleTopicsText} onChange={e => updateForm('moduleTopicsText', e.target.value)} rows={6} />
            </>

            <h3 style={{fontSize:'1.1rem', marginTop:'30px', marginBottom:'16px'}}>What type of learning content should your course include?</h3>
            <div style={styles.checkboxGrid}>
              {Object.keys(formData.contentTypes).map(key => (
                <label key={key} style={styles.checkboxLabel}>
                  <input type="checkbox" checked={formData.contentTypes[key]} onChange={e => updateForm('contentTypes', {...formData.contentTypes, [key]: e.target.checked})} />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================================
            PART 6 & 7: PROGRAMMING & QUIZ SETTINGS
        ========================================================== */}
        {step === 5 && (
          <div className="animate-fade-in">
            {formData.isProgramming && (
              <>
                <div style={styles.header}>PART 6</div>
                <h2 style={styles.title}>Programming Course Settings</h2>
                <p style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'16px'}}>Since this looks like a programming course, you can configure coding-specific elements.</p>
                
                <label style={styles.label}>Programming Language(s)</label>
                <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'30px'}}>
                  {['Python', 'C', 'C++', 'Java', 'JavaScript', 'PHP', 'SQL', 'HTML', 'CSS', 'Other'].map(lang => (
                    <label key={lang} style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'0.9rem', cursor:'pointer'}}>
                      <input type="checkbox" checked={formData.programmingLanguages.includes(lang)} onChange={e => {
                        if(e.target.checked) updateForm('programmingLanguages', [...formData.programmingLanguages, lang]);
                        else updateForm('programmingLanguages', formData.programmingLanguages.filter(l => l !== lang));
                      }} /> {lang}
                    </label>
                  ))}
                </div>
              </>
            )}

            <div style={styles.header}>PART 7</div>
            <h2 style={styles.title}>Module Quiz Settings</h2>
            <div style={{padding:'12px', backgroundColor:'#fef3c7', borderRadius:'8px', border:'1px solid #fde68a', color:'#92400e', fontSize:'0.9rem', marginBottom:'20px'}}>
              <strong>Important:</strong> Every module will automatically have its own quiz generated. 
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Questions per module</label>
                <select style={styles.select} value={formData.quizQuestionsPerModule} onChange={e => updateForm('quizQuestionsPerModule', e.target.value)}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Question Difficulty</label>
                <select style={styles.select} value={formData.quizDifficulty} onChange={e => updateForm('quizDifficulty', e.target.value)}>
                  <option value="Same as module">Same as module</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>

            <label style={styles.label}>Question Types</label>
            <div style={styles.checkboxGrid}>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.mcq} onChange={e => updateForm('quizTypes', {...formData.quizTypes, mcq: e.target.checked})} /> Multiple Choice</label>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.msq} onChange={e => updateForm('quizTypes', {...formData.quizTypes, msq: e.target.checked})} /> Multiple Select</label>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.tf} onChange={e => updateForm('quizTypes', {...formData.quizTypes, tf: e.target.checked})} /> True/False</label>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.fitb} onChange={e => updateForm('quizTypes', {...formData.quizTypes, fitb: e.target.checked})} /> Fill in the Blank</label>
              
              {formData.isProgramming && (
                <>
                  <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.predictOutput} onChange={e => updateForm('quizTypes', {...formData.quizTypes, predictOutput: e.target.checked})} /> Predict Output</label>
                  <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.findError} onChange={e => updateForm('quizTypes', {...formData.quizTypes, findError: e.target.checked})} /> Find the Error</label>
                  <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.completeCode} onChange={e => updateForm('quizTypes', {...formData.quizTypes, completeCode: e.target.checked})} /> Complete the Code</label>
                  <label style={styles.checkboxLabel}><input type="checkbox" checked={formData.quizTypes.chooseCorrect} onChange={e => updateForm('quizTypes', {...formData.quizTypes, chooseCorrect: e.target.checked})} /> Choose Correct Code</label>
                </>
              )}
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Total Marks</label>
                <input style={styles.input} type="number" value={formData.quizTotalMarks} onChange={e => updateForm('quizTotalMarks', e.target.value)} />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Passing Marks</label>
                <input style={styles.input} type="number" value={formData.quizPassingMarks} onChange={e => updateForm('quizPassingMarks', e.target.value)} />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Time Limit (mins)</label>
                <input style={styles.input} type="number" value={formData.quizTimeLimit} onChange={e => updateForm('quizTimeLimit', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            PART 8: REVIEW & GENERATE
        ========================================================== */}
        {step === 6 && (
          <div className="animate-fade-in">
            {generating ? (
              <div style={{textAlign:'center', padding:'40px 20px'}}>
                <Sparkles size={48} color="#0284c7" style={{animation: 'pulse 2s infinite', margin: '0 auto'}} />
                <h2 style={{marginTop:'20px'}}>Generating Course Draft...</h2>
                <div style={{maxWidth:'400px', margin:'0 auto', textAlign:'left'}}>
                  {progressLog.map((log, i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:'10px', margin:'10px 0', color: i === progressLog.length - 1 ? '#0284c7' : '#64748b', fontWeight: i === progressLog.length - 1 ? 'bold' : 'normal'}}>
                      <CheckCircle2 size={16} /> {log}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div style={styles.header}>PART 8</div>
                <h2 style={styles.title}>Course Summary & Generation</h2>
                
                <div style={{backgroundColor:'#f8fafc', padding:'24px', borderRadius:'12px', border:'1px solid #e2e8f0', marginBottom:'24px'}}>
                  <h3 style={{margin:'0 0 16px 0', fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'8px'}}><CheckSquare size={20}/> Course Configuration</h3>
                  
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                    <div><strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Title:</strong> {formData.courseTitle}</div>
                    <div><strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Code:</strong> {formData.courseCode || 'N/A'}</div>
                    <div><strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Target Audience:</strong> {formData.targetAudience}</div>
                    <div><strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Difficulty:</strong> {formData.difficulty}</div>
                    <div><strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Duration:</strong> {formData.durationValue} {formData.duration}</div>
                    <div><strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Modules:</strong> {formData.numModules}</div>
                    <div><strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Creation Method:</strong> AI Smart Builder</div>
                  </div>
                  
                  <div style={{marginTop:'16px'}}>
                    <strong style={{color:'#64748b', fontSize:'0.85rem', display:'block'}}>Learning Objective:</strong> 
                    <p style={{margin:'4px 0 0 0', fontSize:'0.9rem'}}>{formData.primaryObjective}</p>
                  </div>
                </div>

                <div style={{padding:'16px', backgroundColor:'#e0f2fe', borderRadius:'8px', border:'1px solid #bae6fd', color:'#0369a1', fontSize:'0.9rem', marginBottom:'20px'}}>
                  <strong>Next Step:</strong> Click Generate to let the AI build the course structure, modules, topics, and quizzes based on your requirements. The result will be saved as a DRAFT for your review.
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {!generating && (
          <div style={styles.btnGroup}>
            <button style={styles.btnSecondary} onClick={handleBack} disabled={step === 1}>
              <ArrowLeft size={18} /> Back
            </button>
            
            {step < 6 ? (
              <button style={styles.btnPrimary} onClick={handleNext}>
                Continue <ArrowRight size={18} />
              </button>
            ) : (
              <button style={styles.btnPrimary} onClick={handleGenerate}>
                <Sparkles size={18}/> Generate Course Draft
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
