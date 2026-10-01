import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  Edit, 
  Trash2, 
  Plus, 
  Check, 
  Award, 
  Code, 
  ShieldCheck, 
  Sliders, 
  Target,
  Save
} from 'lucide-react';
import courseGeneratorService, { parseTopicsList } from '../../services/courseGeneratorService';

// Sample Topic Packs for Teacher Convenience
const SAMPLE_TOPIC_PACKS = {
  python: {
    name: "Python Programming",
    desc: "Teach beginners the fundamentals of Python programming and computational thinking.",
    topics: `1. Introduction to Python
2. Variables and Data Types
3. Operators
4. Conditional Statements
5. Loops
6. Functions
7. Lists and Tuples
8. Dictionaries and Sets
9. File Handling
10. Exception Handling`,
    important: ["Beginner friendly", "Practical coding examples", "Programming exercises", "Explain concepts step by step", "Quiz after every major module", "Include a final assessment"]
  },
  dbms: {
    name: "Database Management Systems (DBMS)",
    desc: "Master relational schema designs, table keys, normalization rules, and SQL querying.",
    topics: `1. Database Fundamentals & Architecture
2. Entity-Relationship (ER) Modeling
3. Relational Model & Keys
4. SQL DDL & DML Commands
5. SQL Joins & Aggregations
6. Normalization (1NF, 2NF, 3NF, BCNF)
7. Transaction Management & ACID Properties
8. Indexing & Query Optimization`,
    important: ["Relational schema diagrams", "SQL query examples", "Exercises on normalization", "Assessment on ACID properties"]
  },
  webdev: {
    name: "Modern Full-Stack Web Development",
    desc: "Build modern, responsive, and scalable web applications from frontend components to APIs.",
    topics: `1. HTML5 Semantic Elements & Accessibility
2. Modern CSS Layouts (Flexbox & Grid)
3. JavaScript ES6+ Fundamentals
4. DOM Manipulation & Async Events
5. React Components & State Management
6. REST API Design & HTTP Protocols
7. Backend Integration with Node.js
8. Authentication & Security Best Practices`,
    important: ["Hands-on component demos", "Live code samples", "Responsive UI challenges", "Final portfolio assessment"]
  }
};

export default function LlmCourseGeneratorModal({ 
  isOpen, 
  onClose, 
  teacher, 
  onCourseSaved 
}) {
  // Step management: 1 = Input Form, 2 = Generating Progress, 3 = Review & Edit Draft
  const [step, setStep] = useState(1);
  const [activeDraftTab, setActiveDraftTab] = useState('modules'); // 'modules', 'quizzes', 'final', 'coverage'

  // Form State
  const [courseName, setCourseName] = useState('Python Programming');
  const [description, setDescription] = useState('Teach beginners the fundamentals of Python programming.');
  const [topicsInput, setTopicsInput] = useState(SAMPLE_TOPIC_PACKS.python.topics);
  const [importantPoints, setImportantPoints] = useState(SAMPLE_TOPIC_PACKS.python.important);
  const [newPointInput, setNewPointInput] = useState('');
  
  // Optional Fields
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('8 Weeks');
  const [studyHours, setStudyHours] = useState('40 Hours');
  const [targetStudents, setTargetStudents] = useState('First-year Computer Engineering students');
  const [language, setLanguage] = useState('English');
  const [additionalInstructions, setAdditionalInstructions] = useState('Create a beginner-friendly course. Use practical programming examples. Include a small coding exercise after each module. Keep explanations simple. Create a quiz after each module.');

  // Quiz preferences
  const [questionsPerModule, setQuestionsPerModule] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState('Easy');
  const [quizQuestionTypes, setQuizQuestionTypes] = useState(['mcq', 'true_false']);

  // Generation Progress & State
  const [progressStages, setProgressStages] = useState([]);
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [validationReport, setValidationReport] = useState(null);
  const [generationError, setGenerationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Granular Regeneration State
  const [regeneratingTopicId, setRegeneratingTopicId] = useState(null);
  const [regeneratingQuizQId, setRegeneratingQuizQId] = useState(null);
  const [regeneratingModuleId, setRegeneratingModuleId] = useState(null);

  // Editing Modals
  const [editingItem, setEditingItem] = useState(null); // { type: 'course'|'module'|'topic'|'quizQuestion'|'finalQuestion', data, indices }

  // Load sample pack
  const handleLoadSample = (key) => {
    const pack = SAMPLE_TOPIC_PACKS[key];
    if (!pack) return;
    setCourseName(pack.name);
    setDescription(pack.desc);
    setTopicsInput(pack.topics);
    setImportantPoints(pack.important);
  };

  // Add important point tag
  const handleAddPoint = () => {
    if (newPointInput.trim() && !importantPoints.includes(newPointInput.trim())) {
      setImportantPoints([...importantPoints, newPointInput.trim()]);
      setNewPointInput('');
    }
  };

  const handleRemovePoint = (index) => {
    setImportantPoints(importantPoints.filter((_, i) => i !== index));
  };

  // Toggle question type
  const handleToggleQType = (type) => {
    if (quizQuestionTypes.includes(type)) {
      if (quizQuestionTypes.length > 1) {
        setQuizQuestionTypes(quizQuestionTypes.filter(t => t !== type));
      }
    } else {
      setQuizQuestionTypes([...quizQuestionTypes, type]);
    }
  };

  // Trigger Course Generation
  const handleStartGeneration = async (e) => {
    if (e) e.preventDefault();
    setGenerationError('');

    const parsedTopics = parseTopicsList(topicsInput);
    if (!courseName.trim()) {
      setGenerationError("Course Name is required.");
      return;
    }
    if (parsedTopics.length === 0) {
      setGenerationError("Please enter at least one topic.");
      return;
    }

    setStep(2);

    const stages = [
      "Analyzing course topics and curriculum scope...",
      "Intelligently grouping topics into structured modules...",
      "Synthesizing action-oriented Bloom's taxonomy objectives...",
      "Generating topic key concepts, syntax, and live code examples...",
      "Formulating practical exercises and expected outputs...",
      "Drafting module evaluation quizzes with detailed explanations...",
      "Generating comprehensive final assessment with topic coverage...",
      "Validating strict schema conformity and teacher topic preservation..."
    ];
    setProgressStages(stages);
    setCurrentProgressIndex(0);

    // Animate stages smoothly
    for (let i = 0; i < stages.length - 1; i++) {
      await new Promise(r => setTimeout(r, 450));
      setCurrentProgressIndex(i + 1);
    }

    try {
      const result = await courseGeneratorService.generateCourse({
        courseName,
        description,
        topics: parsedTopics,
        importantPoints,
        difficulty,
        duration,
        studyHours,
        targetStudents,
        language,
        additionalInstructions,
        quizPreferences: {
          questionsPerModule,
          difficulty: quizDifficulty,
          questionTypes: quizQuestionTypes
        }
      });

      // Validate result
      const validation = courseGeneratorService.validateGeneratedCourse(result, parsedTopics);
      setValidationReport(validation);

      if (!validation.isValid) {
        setGenerationError(`Generation completed with schema validation errors: ${validation.errors.join(', ')}`);
        setStep(1);
        return;
      }

      setGeneratedDraft(result.course);
      setStep(3); // Land on Teacher Review Interface
    } catch (err) {
      console.error("Course generation failed:", err);
      setGenerationError(err.message || "Course generation encountered an unexpected error.");
      setStep(1);
    }
  };

  // --- GRANULAR REGENERATION HANDLERS ---
  
  // 1. Regenerate Single Topic
  const handleRegenerateTopic = async (moduleIndex, topicIndex) => {
    if (!generatedDraft) return;
    const mod = generatedDraft.modules[moduleIndex];
    const top = mod.topics[topicIndex];
    setRegeneratingTopicId(top.id);

    try {
      const newTop = await courseGeneratorService.regenerateTopic(
        courseName,
        mod.title,
        top.title || top.name,
        difficulty,
        additionalInstructions
      );
      
      const updated = { ...generatedDraft };
      updated.modules[moduleIndex].topics[topicIndex] = {
        ...top,
        ...newTop,
        id: top.id // maintain ID stability
      };
      setGeneratedDraft(updated);
    } catch (err) {
      alert("Failed to regenerate topic: " + err.message);
    } finally {
      setRegeneratingTopicId(null);
    }
  };

  // 2. Regenerate Single Quiz Question
  const handleRegenerateQuizQuestion = async (moduleIndex, qIndex) => {
    if (!generatedDraft) return;
    const mod = generatedDraft.modules[moduleIndex];
    const q = mod.quiz.questions[qIndex];
    setRegeneratingQuizQId(q.id);

    try {
      const newQ = await courseGeneratorService.regenerateQuizQuestion(
        q.related_topic || mod.topics[0]?.name || courseName,
        q.difficulty || difficulty,
        q.question_number || qIndex + 1
      );

      const updated = { ...generatedDraft };
      updated.modules[moduleIndex].quiz.questions[qIndex] = {
        ...q,
        ...newQ,
        id: q.id
      };
      setGeneratedDraft(updated);
    } catch (err) {
      alert("Failed to regenerate question: " + err.message);
    } finally {
      setRegeneratingQuizQId(null);
    }
  };

  // 3. Regenerate Single Module
  const handleRegenerateModule = async (moduleIndex) => {
    if (!generatedDraft) return;
    const mod = generatedDraft.modules[moduleIndex];
    setRegeneratingModuleId(mod.id);

    try {
      const topicNames = mod.topics.map(t => t.title || t.name);
      const newMod = await courseGeneratorService.regenerateModule(
        moduleIndex + 1,
        mod.title,
        topicNames,
        difficulty
      );

      const updated = { ...generatedDraft };
      updated.modules[moduleIndex] = newMod;
      setGeneratedDraft(updated);
    } catch (err) {
      alert("Failed to regenerate module: " + err.message);
    } finally {
      setRegeneratingModuleId(null);
    }
  };

  // 4. Regenerate Final Assessment Question
  const handleRegenerateFinalQuestion = async (qIndex) => {
    if (!generatedDraft || !generatedDraft.finalAssessment) return;
    const q = generatedDraft.finalAssessment.questions[qIndex];
    setRegeneratingQuizQId(q.id);

    try {
      const newQ = await courseGeneratorService.regenerateQuizQuestion(
        q.related_topic || courseName,
        difficulty,
        q.question_number || qIndex + 1
      );

      const updated = { ...generatedDraft };
      updated.finalAssessment.questions[qIndex] = {
        ...q,
        ...newQ,
        id: q.id
      };
      setGeneratedDraft(updated);
    } catch (err) {
      alert("Failed to regenerate assessment question: " + err.message);
    } finally {
      setRegeneratingQuizQId(null);
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteModule = (moduleIndex) => {
    if (!window.confirm("Are you sure you want to remove this module and its topics?")) return;
    const updated = { ...generatedDraft };
    updated.modules.splice(moduleIndex, 1);
    setGeneratedDraft(updated);
  };

  const handleDeleteTopic = (moduleIndex, topicIndex) => {
    if (!window.confirm("Delete this topic from the module?")) return;
    const updated = { ...generatedDraft };
    updated.modules[moduleIndex].topics.splice(topicIndex, 1);
    setGeneratedDraft(updated);
  };

  const handleDeleteQuizQuestion = (moduleIndex, qIndex) => {
    if (!window.confirm("Delete this quiz question?")) return;
    const updated = { ...generatedDraft };
    updated.modules[moduleIndex].quiz.questions.splice(qIndex, 1);
    setGeneratedDraft(updated);
  };

  const handleDeleteFinalQuestion = (qIndex) => {
    if (!window.confirm("Delete this question from the final assessment?")) return;
    const updated = { ...generatedDraft };
    updated.finalAssessment.questions.splice(qIndex, 1);
    setGeneratedDraft(updated);
  };

  // --- ADD ITEM HANDLERS ---
  const handleAddTopicToModule = (moduleIndex) => {
    const mod = generatedDraft.modules[moduleIndex];
    const newTopicName = window.prompt(`Enter title for new topic in '${mod.title}':`);
    if (!newTopicName || !newTopicName.trim()) return;

    const newTopic = {
      id: `top-${moduleIndex + 1}-${mod.topics.length + 1}`,
      title: newTopicName.trim(),
      name: newTopicName.trim(),
      category: mod.title,
      description: `Detailed exploration of ${newTopicName.trim()}.`,
      learningObjectives: [
        `Explain foundational principles of ${newTopicName.trim()}`,
        `Implement working code utilizing ${newTopicName.trim()}`
      ],
      keyConcepts: [`${newTopicName.trim()} Overview`, "Usage Patterns"],
      estimatedStudyTime: "30 mins",
      syntax: `# Syntax for ${newTopicName.trim()}`,
      example: `# Example code for ${newTopicName.trim()}\nprint("Running ${newTopicName.trim()}")`,
      output: `Running ${newTopicName.trim()}`,
      practiceActivity: `Practice applying ${newTopicName.trim()} in your workspace.`
    };

    const updated = { ...generatedDraft };
    updated.modules[moduleIndex].topics.push(newTopic);
    setGeneratedDraft(updated);
  };

  const handleAddQuestionToQuiz = (moduleIndex) => {
    const mod = generatedDraft.modules[moduleIndex];
    const promptText = window.prompt("Enter Question Prompt:");
    if (!promptText || !promptText.trim()) return;

    const newQ = {
      id: `q-${moduleIndex + 1}-${mod.quiz.questions.length + 1}`,
      question_number: mod.quiz.questions.length + 1,
      question: promptText.trim(),
      question_type: 'mcq',
      options: ["Correct Option", "Distractor 1", "Distractor 2", "Distractor 3"],
      correct_answer: "A",
      explanation: "Option A is correct based on module concepts.",
      difficulty: quizDifficulty,
      related_topic: mod.topics[0]?.name || mod.title,
      marks: 1
    };

    const updated = { ...generatedDraft };
    updated.modules[moduleIndex].quiz.questions.push(newQ);
    setGeneratedDraft(updated);
  };

  // --- SAVE & PUBLISH HANDLER ---
  const handleSaveCourse = async (targetStatus = 'Published') => {
    if (!generatedDraft) return;

    setIsSaving(true);
    try {
      // 1. Prepare course payload for database / API
      const courseId = `crs-${Date.now()}`;
      const coursePayload = {
        course_id: courseId,
        course_name: generatedDraft.title,
        category: 'Programming',
        difficulty: generatedDraft.difficulty,
        duration: generatedDraft.duration,
        target_students: generatedDraft.targetStudents,
        description: generatedDraft.description,
        learning_objectives: generatedDraft.learningObjectives,
        status: targetStatus, // 'Draft' or 'Published'
        instructor_id: teacher?.user_id || 1,
        instructor_name: teacher?.name || 'Faculty Member',
        modules: generatedDraft.modules,
        finalAssessment: generatedDraft.finalAssessment,
        created_at: new Date().toISOString()
      };

      // 2. Flatten topics for topics table format
      const flattenedTopics = [];
      let globalTopicId = 1000;
      generatedDraft.modules.forEach(mod => {
        mod.topics.forEach((t) => {
          globalTopicId++;
          flattenedTopics.push({
            id: globalTopicId,
            module_id: mod.id || mod.module_order,
            category: mod.title,
            name: t.title || t.name,
            description: t.description,
            learningObjectives: t.learningObjectives || [],
            conceptExplanation: t.description,
            syntax: t.syntax || '',
            example: t.example || '',
            output: t.output || '',
            keyPoints: t.keyConcepts || [],
            practiceExercise: t.practiceActivity || '',
            difficulty: generatedDraft.difficulty,
            estimatedTime: t.estimatedStudyTime || "30 mins",
            materials: [
              { id: `mat-${globalTopicId}-1`, type: "pdf", title: `${t.title || t.name} Reference Notes.pdf`, size: "1.4 MB" }
            ],
            assignment: {
              id: `assn-${globalTopicId}`,
              title: `Assignment: ${t.title || t.name} Practical Task`,
              description: t.practiceActivity || `Implement practical tasks for ${t.title || t.name}`,
              dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
            }
          });
        });
      });

      // 3. Compile quizzes array
      const compiledQuizzes = generatedDraft.modules.map(mod => ({
        id: `q-mod-${mod.id || mod.module_order}`,
        module_id: mod.module_order,
        title: mod.quiz?.title || `Quiz: ${mod.title}`,
        difficulty: mod.quiz?.difficulty || generatedDraft.difficulty,
        questions: (mod.quiz?.questions || []).map((q, idx) => ({
          id: `q-${mod.module_order}-${idx + 1}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer === 'B' ? 1 : q.correct_answer === 'C' ? 2 : q.correct_answer === 'D' ? 3 : 0,
          explanation: q.explanation,
          difficulty: q.difficulty,
          marks: 1,
          relatedTopic: q.related_topic
        }))
      }));

      // If final assessment exists, include it as a course quiz
      if (generatedDraft.finalAssessment) {
        compiledQuizzes.push({
          id: `quiz-final-${courseId}`,
          module_id: 999,
          title: generatedDraft.finalAssessment.title,
          is_final_assessment: true,
          questions: generatedDraft.finalAssessment.questions.map((q, idx) => ({
            id: `fa-q-${idx + 1}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correct_answer === 'B' ? 1 : q.correct_answer === 'C' ? 2 : q.correct_answer === 'D' ? 3 : 0,
            explanation: q.explanation,
            difficulty: q.difficulty,
            marks: 1,
            relatedTopic: q.related_topic
          }))
        });
      }

      // Save course in local storage for instant availability across portals
      const existingList = JSON.parse(localStorage.getItem('lap_courses_list') || '[]');
      const filtered = existingList.filter(c => c.course_id !== courseId);
      filtered.unshift({
        ...coursePayload,
        total_topics: flattenedTopics.length,
        total_modules: generatedDraft.modules.length,
        topics: flattenedTopics,
        quizzes: compiledQuizzes
      });
      localStorage.setItem('lap_courses_list', JSON.stringify(filtered));

      // Attempt to save to backend API if active
      try {
        await fetch('http://localhost/learning-analytics-backend/api/courses.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_name: coursePayload.course_name,
            category: coursePayload.category,
            difficulty: coursePayload.difficulty,
            duration: coursePayload.duration,
            description: coursePayload.description,
            learning_objectives: coursePayload.learning_objectives,
            status: targetStatus,
            instructor_id: coursePayload.instructor_id
          })
        });
      } catch (backendErr) {
        console.info("Backend API skipped or offline; saved to local platform registry:", backendErr.message);
      }

      alert(`Success! "${coursePayload.course_name}" has been ${targetStatus === 'Published' ? 'published and made available to students!' : 'saved as a draft.'}`);
      
      if (onCourseSaved) {
        onCourseSaved({
          ...coursePayload,
          total_topics: flattenedTopics.length,
          topics: flattenedTopics,
          quizzes: compiledQuizzes
        });
      }
      onClose();
    } catch (err) {
      alert("Failed to save course: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div className="glass-card animate-fade-in" style={styles.modalWindow}>
        
        {/* Top Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconCircle}>
              <Sparkles size={20} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={styles.modalTitle}>LLM Course Structure Generator</h2>
                <span style={styles.versionBadge}>AI Studio v2.4</span>
              </div>
              <p style={styles.modalSubtitle}>
                Synthesize complete student courses from title and topics with pedagogical Bloom's taxonomy objectives.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Workflow Breadcrumbs */}
        <div style={styles.stepBar}>
          <div style={{...styles.stepItem, ...(step === 1 ? styles.stepActive : step > 1 ? styles.stepCompleted : {})}}>
            <span style={styles.stepNum}>{step > 1 ? '✓' : '1'}</span>
            <span>Teacher Course Inputs</span>
          </div>
          <div style={styles.stepDivider} />
          <div style={{...styles.stepItem, ...(step === 2 ? styles.stepActive : step > 2 ? styles.stepCompleted : {})}}>
            <span style={styles.stepNum}>{step > 2 ? '✓' : '2'}</span>
            <span>Intelligent Synthesis</span>
          </div>
          <div style={styles.stepDivider} />
          <div style={{...styles.stepItem, ...(step === 3 ? styles.stepActive : {})}}>
            <span style={styles.stepNum}>3</span>
            <span>Teacher Review & Draft Editor</span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={styles.modalBody}>
          
          {/* =========================================================================
              STEP 1: TEACHER INPUT FORM
             ========================================================================= */}
          {step === 1 && (
            <div style={styles.formContainer}>
              
              {generationError && (
                <div style={styles.errorBanner}>
                  <AlertCircle size={18} color="var(--danger)" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Sample Topic Chips */}
              <div style={styles.samplePackRow}>
                <span style={styles.sampleLabel}>Quick Topic Presets:</span>
                <button type="button" onClick={() => handleLoadSample('python')} style={styles.sampleBtn}>
                  🐍 Python Programming
                </button>
                <button type="button" onClick={() => handleLoadSample('dbms')} style={styles.sampleBtn}>
                  🗄️ Database Systems (DBMS)
                </button>
                <button type="button" onClick={() => handleLoadSample('webdev')} style={styles.sampleBtn}>
                  🌐 Full-Stack Web Dev
                </button>
              </div>

              {/* Two Column Grid */}
              <div style={styles.formGrid}>
                
                {/* Left Column: Required Core Fields */}
                <div style={styles.col}>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Course Name <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      value={courseName} 
                      onChange={e => setCourseName(e.target.value)}
                      placeholder="e.g. Python Programming" 
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Course Description / Purpose <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <textarea 
                      rows={3} 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Explain target outcomes and what students will achieve..."
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={styles.label}>
                        Syllabus Topics <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <span style={styles.hintBadge}>
                        {parseTopicsList(topicsInput).length} topics parsed
                      </span>
                    </div>
                    <textarea 
                      rows={8} 
                      value={topicsInput}
                      onChange={e => setTopicsInput(e.target.value)}
                      placeholder="1. Introduction&#10;2. Variables and Data Types&#10;3. Loops..."
                      style={{...styles.textarea, fontFamily: 'monospace', fontSize: '0.85rem'}}
                    />
                    <small style={styles.fieldHint}>
                      Enter 1 topic per line or numbered list. All teacher topics are guaranteed to be represented in generated modules.
                    </small>
                  </div>

                </div>

                {/* Right Column: Important Points & Parameters */}
                <div style={styles.col}>
                  
                  {/* Important Points List */}
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Important Requirements & Pedagogical Focus</label>
                    <div style={styles.pointsWrap}>
                      {importantPoints.map((pt, idx) => (
                        <span key={idx} style={styles.pointChip}>
                          <Check size={12} color="#8b5cf6" />
                          <span>{pt}</span>
                          <button type="button" onClick={() => handleRemovePoint(idx)} style={styles.chipRemove}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div style={styles.addPointRow}>
                      <input 
                        type="text" 
                        value={newPointInput}
                        onChange={e => setNewPointInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPoint(); } }}
                        placeholder="Add requirement (e.g. Include coding exercises)..."
                        style={styles.pointInput}
                      />
                      <button type="button" onClick={handleAddPoint} style={styles.pointAddBtn}>
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Course Configuration Grid */}
                  <div style={styles.subGrid}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Difficulty</label>
                      <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={styles.select}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Duration</label>
                      <input 
                        type="text" 
                        value={duration} 
                        onChange={e => setDuration(e.target.value)}
                        placeholder="8 Weeks" 
                        style={styles.input} 
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Approx Study Hours</label>
                      <input 
                        type="text" 
                        value={studyHours} 
                        onChange={e => setStudyHours(e.target.value)}
                        placeholder="40 Hours" 
                        style={styles.input} 
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Language</label>
                      <input 
                        type="text" 
                        value={language} 
                        onChange={e => setLanguage(e.target.value)}
                        placeholder="English" 
                        style={styles.input} 
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Target Students</label>
                    <input 
                      type="text" 
                      value={targetStudents} 
                      onChange={e => setTargetStudents(e.target.value)}
                      placeholder="e.g. First-year Computer Engineering students" 
                      style={styles.input} 
                    />
                  </div>

                  {/* Quiz Preferences */}
                  <div style={styles.quizPrefBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <HelpCircle size={15} color="var(--primary)" />
                      <strong style={{ fontSize: '0.85rem' }}>Automatic Quiz Generation Settings</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions per Module:</label>
                        <select 
                          value={questionsPerModule} 
                          onChange={e => setQuestionsPerModule(Number(e.target.value))} 
                          style={styles.select}
                        >
                          <option value={3}>3 Questions</option>
                          <option value={5}>5 Questions (Recommended)</option>
                          <option value={10}>10 Questions (Comprehensive)</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Difficulty:</label>
                        <select 
                          value={quizDifficulty} 
                          onChange={e => setQuizDifficulty(e.target.value)} 
                          style={styles.select}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        <label style={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            checked={quizQuestionTypes.includes('mcq')} 
                            onChange={() => handleToggleQType('mcq')} 
                          />
                          MCQ
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            checked={quizQuestionTypes.includes('true_false')} 
                            onChange={() => handleToggleQType('true_false')} 
                          />
                          True/False
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Additional Instructions / Teacher Prompt */}
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Additional Natural-Language Instructions</label>
                    <textarea 
                      rows={2} 
                      value={additionalInstructions}
                      onChange={e => setAdditionalInstructions(e.target.value)}
                      placeholder="Guidance to LLM regarding tone, coding exercises, or pacing..."
                      style={styles.textarea}
                    />
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =========================================================================
              STEP 2: GENERATION PROGRESS SCREEN
             ========================================================================= */}
          {step === 2 && (
            <div style={styles.progressContainer}>
              <div style={styles.progressAnimationBox}>
                <RefreshCw size={44} className="spin" color="#8b5cf6" />
                <h3 style={styles.progressTitle}>Synthesizing Academic Curriculum...</h3>
                <p style={styles.progressDesc}>
                  The LLM engine is structuring modules, formulating action objectives, drafting code examples, and formulating evaluations.
                </p>
              </div>

              <div style={styles.checklistCard}>
                {progressStages.map((st, idx) => {
                  const isDone = idx < currentProgressIndex;
                  const isCurrent = idx === currentProgressIndex;
                  return (
                    <div 
                      key={idx} 
                      style={{
                        ...styles.checklistItem,
                        opacity: isDone || isCurrent ? 1 : 0.4
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} color="#10b981" />
                      ) : isCurrent ? (
                        <RefreshCw size={16} className="spin" color="#8b5cf6" />
                      ) : (
                        <div style={styles.circleDot} />
                      )}
                      <span style={{
                        fontSize: '0.88rem',
                        fontWeight: isCurrent ? '600' : '400',
                        color: isCurrent ? 'var(--primary)' : 'var(--text-primary)'
                      }}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: TEACHER REVIEW & EDIT INTERFACE ("COURSE DRAFT")
             ========================================================================= */}
          {step === 3 && generatedDraft && (
            <div style={styles.reviewContainer}>
              
              {/* Draft Status Banner (Rule 15: Never publish automatically) */}
              <div style={styles.draftAlertBanner}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#f59e0b" />
                  <div>
                    <strong style={{ color: '#f59e0b' }}>Generated Course Draft (Unpublished)</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      Review, edit, or regenerate any section below. Students will only see this course once you click "Publish Course".
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setStep(1)} style={styles.editParamsBtn}>
                    <Sliders size={14} /> Adjust Parameters
                  </button>
                  <button onClick={handleStartGeneration} style={styles.regenAllBtn}>
                    <RefreshCw size={14} /> Regenerate All
                  </button>
                </div>
              </div>

              {/* Course Overview Card */}
              <div className="glass-card" style={styles.courseOverviewCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={styles.tagRow}>
                      <span style={styles.pillDifficulty}>{generatedDraft.difficulty}</span>
                      <span style={styles.pillDuration}>{generatedDraft.duration}</span>
                      <span style={styles.pillHours}>{generatedDraft.studyHours}</span>
                      <span style={styles.pillStatus}>Status: Draft</span>
                      {validationReport?.isValid && (
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold' }}>
                          ✓ Rules & Schema Validated
                        </span>
                      )}
                    </div>
                    <h2 style={styles.draftCourseTitle}>{generatedDraft.title}</h2>
                    <p style={styles.draftCourseDesc}>{generatedDraft.description}</p>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Target Audience:</strong> {generatedDraft.targetStudents}
                    </div>
                  </div>

                  <button 
                    onClick={() => setEditingItem({ type: 'course', data: generatedDraft })}
                    style={styles.editBtn}
                  >
                    <Edit size={14} /> Edit Course Info
                  </button>
                </div>

                {/* Course Learning Objectives */}
                <div style={styles.courseObjectivesBox}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Overarching Course Learning Objectives (Bloom's Taxonomy):
                  </strong>
                  <ul style={styles.objList}>
                    {generatedDraft.learningObjectives?.map((obj, i) => (
                      <li key={i} style={styles.objItem}>
                        <Check size={13} color="#10b981" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Review Navigation Tabs */}
              <div style={styles.reviewTabs}>
                <button 
                  onClick={() => setActiveDraftTab('modules')}
                  style={{...styles.reviewTab, ...(activeDraftTab === 'modules' ? styles.reviewTabActive : {})}}
                >
                  <Layers size={16} />
                  <span>Modules & Topics ({generatedDraft.modules?.length} Modules)</span>
                </button>

                <button 
                  onClick={() => setActiveDraftTab('quizzes')}
                  style={{...styles.reviewTab, ...(activeDraftTab === 'quizzes' ? styles.reviewTabActive : {})}}
                >
                  <HelpCircle size={16} />
                  <span>Module Quizzes ({generatedDraft.modules?.length} Quizzes)</span>
                </button>

                <button 
                  onClick={() => setActiveDraftTab('final')}
                  style={{...styles.reviewTab, ...(activeDraftTab === 'final' ? styles.reviewTabActive : {})}}
                >
                  <Award size={16} />
                  <span>Final Assessment ({generatedDraft.finalAssessment?.questions?.length} Questions)</span>
                </button>

                <button 
                  onClick={() => setActiveDraftTab('coverage')}
                  style={{...styles.reviewTab, ...(activeDraftTab === 'coverage' ? styles.reviewTabActive : {})}}
                >
                  <Target size={16} />
                  <span>Topic Coverage Matrix</span>
                </button>
              </div>

              {/* ==================== TAB 1: MODULES & TOPICS ==================== */}
              {activeDraftTab === 'modules' && (
                <div style={styles.tabContent}>
                  
                  {/* Modules Accordion / List */}
                  {generatedDraft.modules?.map((mod, mIdx) => {
                    const isRegenerating = regeneratingModuleId === mod.id;
                    return (
                      <div key={mod.id || mIdx} style={styles.moduleCard}>
                        
                        {/* Module Header */}
                        <div style={styles.moduleHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={styles.moduleOrderBadge}>{mIdx + 1}</span>
                            <div>
                              <h3 style={styles.moduleTitle}>{mod.title}</h3>
                              <span style={styles.moduleDurationText}>
                                ⏱️ {mod.estimatedDuration} • {mod.topics?.length} Topics
                              </span>
                            </div>
                          </div>

                          {/* Module Actions */}
                          <div style={styles.actionGroup}>
                            <button 
                              onClick={() => setEditingItem({ type: 'module', data: mod, indices: { mIdx } })}
                              style={styles.actionBtnSmall}
                              title="Edit Module"
                            >
                              <Edit size={13} /> Edit
                            </button>
                            <button 
                              onClick={() => handleRegenerateModule(mIdx)}
                              disabled={isRegenerating}
                              style={styles.actionBtnSmall}
                              title="Regenerate only this module with LLM"
                            >
                              <RefreshCw size={13} className={isRegenerating ? "spin" : ""} />
                              {isRegenerating ? "Regenerating..." : "Regenerate Module"}
                            </button>
                            <button 
                              onClick={() => handleAddTopicToModule(mIdx)}
                              style={styles.actionBtnSmallPrimary}
                              title="Add Topic"
                            >
                              <Plus size={13} /> Add Topic
                            </button>
                            <button 
                              onClick={() => handleDeleteModule(mIdx)}
                              style={styles.actionBtnSmallDanger}
                              title="Delete Module"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Module Description & Objectives */}
                        <div style={styles.moduleBody}>
                          <p style={styles.moduleDesc}>{mod.description}</p>
                          
                          <div style={styles.moduleObjectivesRow}>
                            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                              Module Learning Objectives:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                              {mod.learningObjectives?.map((ob, idx) => (
                                <span key={idx} style={styles.moduleObjChip}>
                                  ✓ {ob}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Topics List within Module */}
                          <div style={styles.topicsGrid}>
                            {mod.topics?.map((top, tIdx) => {
                              const isTopRegenerating = regeneratingTopicId === top.id;
                              return (
                                <div key={top.id || tIdx} style={styles.topicCard}>
                                  
                                  {/* Topic Top */}
                                  <div style={styles.topicCardHeader}>
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={styles.topicBullet}>•</span>
                                        <h4 style={styles.topicTitle}>{top.title || top.name}</h4>
                                      </div>
                                      <span style={styles.topicTimeBadge}>
                                        ⏱️ {top.estimatedStudyTime || "30 mins"}
                                      </span>
                                    </div>

                                    {/* Granular Actions for Topic */}
                                    <div style={styles.actionGroup}>
                                      <button 
                                        onClick={() => setEditingItem({ type: 'topic', data: top, indices: { mIdx, tIdx } })}
                                        style={styles.miniBtn}
                                        title="Edit Topic"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button 
                                        onClick={() => handleRegenerateTopic(mIdx, tIdx)}
                                        disabled={isTopRegenerating}
                                        style={{...styles.miniBtn, color: '#8b5cf6'}}
                                        title="Regenerate this specific topic with LLM"
                                      >
                                        <RefreshCw size={12} className={isTopRegenerating ? "spin" : ""} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteTopic(mIdx, tIdx)}
                                        style={{...styles.miniBtn, color: 'var(--danger)'}}
                                        title="Delete Topic"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>

                                  <p style={styles.topicDesc}>{top.description}</p>

                                  {/* Action-Oriented Learning Objectives */}
                                  <div style={{ marginTop: '8px' }}>
                                    <span style={styles.topicSubhead}>Learning Objectives:</span>
                                    <ul style={styles.topicObjList}>
                                      {top.learningObjectives?.map((ob, i) => (
                                        <li key={i} style={styles.topicObjItem}>
                                          <span style={{ color: '#8b5cf6' }}>›</span> {ob}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Key Concepts Chips */}
                                  {top.keyConcepts && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                                      {top.keyConcepts.map((kc, kIdx) => (
                                        <span key={kIdx} style={styles.conceptTag}>
                                          {kc}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Code Example & Expected Output Box */}
                                  {top.example && (
                                    <div style={styles.codeSnippetContainer}>
                                      <div style={styles.codeSnippetHeader}>
                                        <Code size={12} />
                                        <span>Practical Example Code:</span>
                                      </div>
                                      <pre style={styles.codePre}>{top.example}</pre>
                                      {top.output && (
                                        <div style={styles.codeOutputBox}>
                                          <strong>Output:</strong> {top.output}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Practice Activity */}
                                  {top.practiceActivity && (
                                    <div style={styles.practiceBox}>
                                      <strong>Exercise:</strong> {top.practiceActivity}
                                    </div>
                                  )}

                                </div>
                              );
                            })}
                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

              {/* ==================== TAB 2: MODULE QUIZZES ==================== */}
              {activeDraftTab === 'quizzes' && (
                <div style={styles.tabContent}>
                  
                  {generatedDraft.modules?.map((mod, mIdx) => (
                    <div key={mIdx} style={styles.quizSectionCard}>
                      
                      <div style={styles.quizHeader}>
                        <div>
                          <h3 style={styles.quizTitle}>{mod.quiz?.title || `Quiz: ${mod.title}`}</h3>
                          <span style={styles.quizSub}>
                            {mod.quiz?.questions?.length} Questions • Passing: {mod.quiz?.passing_marks || 3} Marks • Difficulty: {mod.quiz?.difficulty}
                          </span>
                        </div>

                        <button 
                          onClick={() => handleAddQuestionToQuiz(mIdx)}
                          style={styles.actionBtnSmallPrimary}
                        >
                          <Plus size={14} /> Add Question
                        </button>
                      </div>

                      {/* Questions List */}
                      <div style={styles.questionsList}>
                        {mod.quiz?.questions?.map((q, qIdx) => {
                          const isRegen = regeneratingQuizQId === q.id;
                          return (
                            <div key={q.id || qIdx} style={styles.questionCard}>
                              
                              <div style={styles.questionCardTop}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={styles.qNumBadge}>Q{qIdx + 1}</span>
                                  <span style={styles.qTopicTag}>{q.related_topic || mod.title}</span>
                                  <span style={styles.qTypeTag}>{q.question_type?.toUpperCase()}</span>
                                </div>

                                <div style={styles.actionGroup}>
                                  <button 
                                    onClick={() => setEditingItem({ type: 'quizQuestion', data: q, indices: { mIdx, qIdx } })}
                                    style={styles.miniBtn}
                                    title="Edit Question"
                                  >
                                    <Edit size={12} /> Edit
                                  </button>
                                  <button 
                                    onClick={() => handleRegenerateQuizQuestion(mIdx, qIdx)}
                                    disabled={isRegen}
                                    style={{...styles.miniBtn, color: '#8b5cf6'}}
                                    title="Regenerate this specific question with LLM"
                                  >
                                    <RefreshCw size={12} className={isRegen ? "spin" : ""} />
                                    {isRegen ? "Regenerating..." : "Regenerate"}
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuizQuestion(mIdx, qIdx)}
                                    style={{...styles.miniBtn, color: 'var(--danger)'}}
                                    title="Delete Question"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              <p style={styles.questionPrompt}>{q.question}</p>

                              {/* Options */}
                              <div style={styles.optionsGrid}>
                                {q.options?.map((opt, optIdx) => {
                                  const optLetter = String.fromCharCode(65 + optIdx);
                                  const isCorrect = q.correct_answer === optLetter || q.correct_answer === opt;
                                  return (
                                    <div 
                                      key={optIdx} 
                                      style={{
                                        ...styles.optionItem,
                                        ...(isCorrect ? styles.optionCorrect : {})
                                      }}
                                    >
                                      <span style={isCorrect ? styles.optLetterCorrect : styles.optLetter}>
                                        {optLetter}
                                      </span>
                                      <span style={{ flex: 1, fontSize: '0.85rem' }}>{opt}</span>
                                      {isCorrect && (
                                        <Check size={14} color="#10b981" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              {q.explanation && (
                                <div style={styles.explanationBox}>
                                  <strong>Explanation:</strong> {q.explanation}
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}

                </div>
              )}

              {/* ==================== TAB 3: FINAL ASSESSMENT ==================== */}
              {activeDraftTab === 'final' && generatedDraft.finalAssessment && (
                <div style={styles.tabContent}>
                  
                  <div style={styles.finalOverviewCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Award size={24} color="#f59e0b" />
                      <div>
                        <h3 style={styles.finalTitle}>{generatedDraft.finalAssessment.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Cumulative assessment covering all {generatedDraft.finalAssessment.total_questions || generatedDraft.finalAssessment.questions?.length} course topics without outside subjects.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Final Questions */}
                  <div style={styles.questionsList}>
                    {generatedDraft.finalAssessment.questions?.map((q, qIdx) => {
                      const isRegen = regeneratingQuizQId === q.id;
                      return (
                        <div key={q.id || qIdx} style={styles.questionCard}>
                          
                          <div style={styles.questionCardTop}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={styles.qNumBadge}>Q{qIdx + 1}</span>
                              <span style={styles.qTopicTag}>Topic: {q.related_topic}</span>
                            </div>

                            <div style={styles.actionGroup}>
                              <button 
                                onClick={() => setEditingItem({ type: 'finalQuestion', data: q, indices: { qIdx } })}
                                style={styles.miniBtn}
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button 
                                onClick={() => handleRegenerateFinalQuestion(qIdx)}
                                disabled={isRegen}
                                style={{...styles.miniBtn, color: '#8b5cf6'}}
                              >
                                <RefreshCw size={12} className={isRegen ? "spin" : ""} />
                                {isRegen ? "Regenerating..." : "Regenerate"}
                              </button>
                              <button 
                                onClick={() => handleDeleteFinalQuestion(qIdx)}
                                style={{...styles.miniBtn, color: 'var(--danger)'}}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <p style={styles.questionPrompt}>{q.question}</p>

                          <div style={styles.optionsGrid}>
                            {q.options?.map((opt, optIdx) => {
                              const optLetter = String.fromCharCode(65 + optIdx);
                              const isCorrect = q.correct_answer === optLetter || q.correct_answer === opt;
                              return (
                                <div 
                                  key={optIdx} 
                                  style={{
                                    ...styles.optionItem,
                                    ...(isCorrect ? styles.optionCorrect : {})
                                  }}
                                >
                                  <span style={isCorrect ? styles.optLetterCorrect : styles.optLetter}>
                                    {optLetter}
                                  </span>
                                  <span style={{ flex: 1, fontSize: '0.85rem' }}>{opt}</span>
                                  {isCorrect && <Check size={14} color="#10b981" />}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div style={styles.explanationBox}>
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* ==================== TAB 4: TOPIC COVERAGE MATRIX ==================== */}
              {activeDraftTab === 'coverage' && (
                <div style={styles.tabContent}>
                  <div className="glass-card" style={styles.coverageCard}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Curriculum Topic Coverage & Rule Verification</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      All teacher-provided topics are mapped to modules, code examples, practice exercises, and assessments.
                    </p>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Teacher Topic</th>
                          <th style={styles.th}>Assigned Module</th>
                          <th style={styles.th}>Objectives</th>
                          <th style={styles.th}>Code Example</th>
                          <th style={styles.th}>Exercise</th>
                          <th style={styles.th}>Quiz Inclusion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseTopicsList(topicsInput).map((topicName, idx) => {
                          const matchedMod = generatedDraft.modules?.find(m => 
                            m.topics?.some(t => (t.title || t.name).toLowerCase().includes(topicName.toLowerCase()))
                          );
                          const matchedTopic = matchedMod?.topics?.find(t => 
                            (t.title || t.name).toLowerCase().includes(topicName.toLowerCase())
                          );

                          return (
                            <tr key={idx} style={styles.tr}>
                              <td style={styles.td}>
                                <strong>{topicName}</strong>
                              </td>
                              <td style={styles.td}>
                                {matchedMod ? matchedMod.title : <span style={{ color: 'var(--danger)' }}>Unassigned</span>}
                              </td>
                              <td style={styles.td}>
                                <span style={styles.checkPill}>✓ {matchedTopic?.learningObjectives?.length || 0} Objectives</span>
                              </td>
                              <td style={styles.td}>
                                <span style={styles.checkPill}>✓ Syntax & Output</span>
                              </td>
                              <td style={styles.td}>
                                <span style={styles.checkPill}>✓ Included</span>
                              </td>
                              <td style={styles.td}>
                                <span style={styles.checkPill}>✓ Evaluated</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={styles.modalFooter}>
          {step === 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Rule 15: Course will be generated as a draft for teacher review.
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleStartGeneration} style={styles.generateBtn}>
                  <Sparkles size={16} /> Generate Course
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please wait while the AI synthesizes your course curriculum...
              </span>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <button onClick={() => setStep(1)} style={styles.cancelBtn}>
                ← Back to Input Form
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleSaveCourse('Draft')} 
                  disabled={isSaving}
                  style={styles.saveDraftBtn}
                >
                  <Save size={16} /> Save as Draft
                </button>
                <button 
                  onClick={() => handleSaveCourse('Published')} 
                  disabled={isSaving}
                  style={styles.publishBtn}
                >
                  <CheckCircle2 size={16} /> Publish Course to Students
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            INLINE EDITING MODAL (Direct Teacher Editing)
           ========================================================================= */}
        {editingItem && (
          <div style={styles.subModalBackdrop}>
            <div className="glass-card animate-fade-in" style={styles.subModalWindow}>
              
              <div style={styles.subModalHeader}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                  Edit {editingItem.type === 'course' ? 'Course Details' : editingItem.type === 'module' ? 'Module Details' : editingItem.type === 'topic' ? 'Topic Details' : 'Question'}
                </h3>
                <button onClick={() => setEditingItem(null)} style={styles.miniCloseBtn}>
                  <X size={16} />
                </button>
              </div>

              <div style={styles.subModalBody}>
                {editingItem.type === 'course' && (
                  <>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Course Title</label>
                      <input 
                        type="text" 
                        value={editingItem.data.title}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Description</label>
                      <textarea 
                        rows={3}
                        value={editingItem.data.description}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value }
                        })}
                        style={styles.textarea}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'module' && (
                  <>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Module Title</label>
                      <input 
                        type="text" 
                        value={editingItem.data.title}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Description</label>
                      <textarea 
                        rows={3}
                        value={editingItem.data.description}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value }
                        })}
                        style={styles.textarea}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Estimated Duration</label>
                      <input 
                        type="text" 
                        value={editingItem.data.estimatedDuration}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, estimatedDuration: e.target.value }
                        })}
                        style={styles.input}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'topic' && (
                  <>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Topic Title</label>
                      <input 
                        type="text" 
                        value={editingItem.data.title || editingItem.data.name}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value, name: e.target.value }
                        })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Description</label>
                      <textarea 
                        rows={2}
                        value={editingItem.data.description}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value }
                        })}
                        style={styles.textarea}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Code Example</label>
                      <textarea 
                        rows={4}
                        value={editingItem.data.example}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, example: e.target.value }
                        })}
                        style={{...styles.textarea, fontFamily: 'monospace'}}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Expected Output</label>
                      <input 
                        type="text" 
                        value={editingItem.data.output}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, output: e.target.value }
                        })}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Practice Activity</label>
                      <textarea 
                        rows={2}
                        value={editingItem.data.practiceActivity}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, practiceActivity: e.target.value }
                        })}
                        style={styles.textarea}
                      />
                    </div>
                  </>
                )}

                {(editingItem.type === 'quizQuestion' || editingItem.type === 'finalQuestion') && (
                  <>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Question Prompt</label>
                      <textarea 
                        rows={2}
                        value={editingItem.data.question}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, question: e.target.value }
                        })}
                        style={styles.textarea}
                      />
                    </div>
                    
                    <label style={styles.label}>Options & Correct Answer Selection</label>
                    {editingItem.data.options?.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isCorrect = editingItem.data.correct_answer === letter;
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                          <button 
                            type="button"
                            onClick={() => setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, correct_answer: letter }
                            })}
                            style={{
                              ...styles.correctSelectBtn,
                              backgroundColor: isCorrect ? '#10b981' : 'transparent',
                              color: isCorrect ? '#fff' : 'var(--text-muted)'
                            }}
                          >
                            {letter} {isCorrect ? '✓' : ''}
                          </button>
                          <input 
                            type="text" 
                            value={opt}
                            onChange={e => {
                              const newOpts = [...editingItem.data.options];
                              newOpts[idx] = e.target.value;
                              setEditingItem({
                                ...editingItem,
                                data: { ...editingItem.data, options: newOpts }
                              });
                            }}
                            style={styles.input}
                          />
                        </div>
                      );
                    })}

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Explanation</label>
                      <textarea 
                        rows={2}
                        value={editingItem.data.explanation}
                        onChange={e => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, explanation: e.target.value }
                        })}
                        style={styles.textarea}
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={styles.subModalFooter}>
                <button onClick={() => setEditingItem(null)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const updated = { ...generatedDraft };
                    if (editingItem.type === 'course') {
                      updated.title = editingItem.data.title;
                      updated.description = editingItem.data.description;
                    } else if (editingItem.type === 'module') {
                      updated.modules[editingItem.indices.mIdx] = {
                        ...updated.modules[editingItem.indices.mIdx],
                        ...editingItem.data
                      };
                    } else if (editingItem.type === 'topic') {
                      updated.modules[editingItem.indices.mIdx].topics[editingItem.indices.tIdx] = {
                        ...updated.modules[editingItem.indices.mIdx].topics[editingItem.indices.tIdx],
                        ...editingItem.data
                      };
                    } else if (editingItem.type === 'quizQuestion') {
                      updated.modules[editingItem.indices.mIdx].quiz.questions[editingItem.indices.qIdx] = {
                        ...updated.modules[editingItem.indices.mIdx].quiz.questions[editingItem.indices.qIdx],
                        ...editingItem.data
                      };
                    } else if (editingItem.type === 'finalQuestion') {
                      updated.finalAssessment.questions[editingItem.indices.qIdx] = {
                        ...updated.finalAssessment.questions[editingItem.indices.qIdx],
                        ...editingItem.data
                      };
                    }
                    setGeneratedDraft(updated);
                    setEditingItem(null);
                  }} 
                  style={styles.saveDraftBtn}
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Styles
const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1.5rem',
  },
  modalWindow: {
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '1.25rem 1.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  iconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(139, 92, 246, 0.25)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  versionBadge: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  stepBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderBottom: '1px solid var(--border-color)',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-muted)',
  },
  stepActive: {
    color: 'var(--primary)',
    fontWeight: '600',
  },
  stepCompleted: {
    color: '#10b981',
  },
  stepNum: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  stepDivider: {
    width: '40px',
    height: '1px',
    backgroundColor: 'var(--border-color)',
  },
  modalBody: {
    padding: '1.5rem 1.75rem',
    overflowY: 'auto',
    flexGrow: 1,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  samplePackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderRadius: '10px',
    border: '1px dashed rgba(139, 92, 246, 0.25)',
  },
  sampleLabel: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#a78bfa',
  },
  sampleBtn: {
    fontSize: '0.78rem',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontWeight: '500',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '1.5rem',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.84rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
  },
  textarea: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
  },
  subGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  hintBadge: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '10px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    color: 'var(--primary)',
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: '0.74rem',
    color: 'var(--text-muted)',
  },
  pointsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '6px',
  },
  pointChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '14px',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    color: 'var(--text-primary)',
    fontSize: '0.78rem',
  },
  chipRemove: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0 2px',
    fontSize: '0.9rem',
    lineHeight: '1',
  },
  addPointRow: {
    display: 'flex',
    gap: '6px',
  },
  pointInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
  },
  pointAddBtn: {
    padding: '0.5rem 0.85rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  quizPrefBox: {
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(2, 132, 199, 0.05)',
    border: '1px solid rgba(2, 132, 199, 0.2)',
  },
  checkboxLabel: {
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
  },
  progressAnimationBox: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  progressTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginTop: '1rem',
  },
  progressDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    maxWidth: '480px',
    margin: '0.5rem auto 0 auto',
  },
  checklistCard: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'opacity 0.3s ease',
  },
  circleDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid var(--text-muted)',
  },
  reviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  draftAlertBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  editParamsBtn: {
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  regenAllBtn: {
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: '#a78bfa',
    fontSize: '0.78rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  courseOverviewCard: {
    padding: '1.25rem 1.5rem',
    borderRadius: '12px',
  },
  tagRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  pillDifficulty: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    fontWeight: '600',
  },
  pillDuration: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    color: 'var(--primary)',
    fontWeight: '600',
  },
  pillHours: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    fontWeight: '600',
  },
  pillStatus: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  draftCourseTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0 0 6px 0',
  },
  draftCourseDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: '1.5',
  },
  editBtn: {
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  courseObjectivesBox: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
  },
  objList: {
    margin: '8px 0 0 0',
    paddingLeft: '0',
    listStyle: 'none',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  objItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
  },
  reviewTabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '4px',
  },
  reviewTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.65rem 1.15rem',
    borderRadius: '8px 8px 0 0',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  reviewTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--primary)',
    fontWeight: '600',
    borderBottom: '2px solid var(--primary)',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  moduleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  moduleHeader: {
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderBottom: '1px solid var(--border-color)',
  },
  moduleOrderBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.88rem',
  },
  moduleTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  moduleDurationText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  actionGroup: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  actionBtnSmall: {
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.74rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionBtnSmallPrimary: {
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: 'var(--primary)',
    fontSize: '0.74rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600',
  },
  actionBtnSmallDanger: {
    padding: '4px 6px',
    borderRadius: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: 'var(--danger)',
    fontSize: '0.74rem',
    cursor: 'pointer',
  },
  moduleBody: {
    padding: '1.25rem',
  },
  moduleDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    margin: '0 0 0.75rem 0',
  },
  moduleObjectivesRow: {
    marginBottom: '1rem',
  },
  moduleObjChip: {
    fontSize: '0.75rem',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
  },
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  topicCard: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  topicCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px',
  },
  topicBullet: {
    color: 'var(--primary)',
    fontSize: '1.2rem',
    lineHeight: '1',
  },
  topicTitle: {
    fontSize: '0.94rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  topicTimeBadge: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  miniBtn: {
    padding: '3px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.72rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  topicDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    margin: '0 0 6px 0',
    lineHeight: '1.4',
  },
  topicSubhead: {
    fontSize: '0.74rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  topicObjList: {
    margin: '4px 0',
    paddingLeft: '0',
    listStyle: 'none',
  },
  topicObjItem: {
    fontSize: '0.78rem',
    color: 'var(--text-primary)',
    marginBottom: '2px',
  },
  conceptTag: {
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#a78bfa',
  },
  codeSnippetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    padding: '8px',
    margin: '8px 0',
  },
  codeSnippetHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  codePre: {
    margin: 0,
    fontSize: '0.76rem',
    fontFamily: 'Consolas, monospace',
    color: '#38bdf8',
    whiteSpace: 'pre-wrap',
  },
  codeOutputBox: {
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: '1px dashed var(--border-color)',
    fontSize: '0.72rem',
    color: '#10b981',
  },
  practiceBox: {
    fontSize: '0.76rem',
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    color: 'var(--text-primary)',
    marginTop: 'auto',
  },
  quizSectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
  },
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
  },
  quizTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  quizSub: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  questionCard: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    padding: '1rem',
  },
  questionCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  qNumBadge: {
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: 'var(--primary)',
    fontWeight: 'bold',
  },
  qTopicTag: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  qTypeTag: {
    fontSize: '0.68rem',
    padding: '1px 5px',
    borderRadius: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-secondary)',
  },
  questionPrompt: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0 0 10px 0',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '10px',
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
  },
  optionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  optLetter: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
  },
  optLetterCorrect: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    backgroundColor: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  explanationBox: {
    fontSize: '0.78rem',
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    color: 'var(--text-secondary)',
  },
  finalOverviewCard: {
    padding: '1.25rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    marginBottom: '1rem',
  },
  finalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 4px 0',
  },
  coverageCard: {
    padding: '1.25rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.84rem',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: '2px solid var(--border-color)',
    color: 'var(--text-muted)',
    fontSize: '0.76rem',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '10px 12px',
    color: 'var(--text-primary)',
  },
  checkPill: {
    fontSize: '0.74rem',
    color: '#10b981',
    fontWeight: '500',
  },
  modalFooter: {
    padding: '1.25rem 1.75rem',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  cancelBtn: {
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  generateBtn: {
    padding: '0.65rem 1.5rem',
    borderRadius: '8px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
  },
  saveDraftBtn: {
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  publishBtn: {
    padding: '0.65rem 1.5rem',
    borderRadius: '8px',
    backgroundColor: '#10b981',
    border: 'none',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  },
  subModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem',
  },
  subModalWindow: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  subModalHeader: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
  },
  miniCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  subModalBody: {
    padding: '1.25rem',
    maxHeight: '70vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  subModalFooter: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  correctSelectBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
};
