import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Save,
  Send,
  Archive,
  RefreshCw,
  ArrowLeft,
  Check,
  X,
  FolderPlus,
  Clock,
  Award,
  Users,
  Target,
  Sliders
} from 'lucide-react';
import teacherService from '../../services/teacherService';

const EMPTY_COURSE_DRAFT = {
  id: null,
  course_name: '',
  course_code: '',
  short_description: '',
  description: '',
  category: 'Programming',
  difficulty: 'Beginner',
  duration: '6 Weeks',
  prerequisites: '',
  target_audience: '',
  status: 'draft',
  creation_method: 'manual',
  learning_objectives: [
    'Understand core foundational concepts and terminology',
    'Apply structured problem-solving and practical implementation techniques'
  ],
  modules: [
    {
      module_name: 'Module 1: Core Foundations',
      description: 'Introduction to essential principles, environment setup, and foundational building blocks.',
      difficulty: 'Beginner',
      duration: '2 Weeks',
      display_order: 1,
      learning_objectives: [
        'Set up the working environment and execute basic operations',
        'Explain the core building blocks of the subject'
      ],
      topics: [
        {
          topic_name: 'Topic 1: Introduction & Overview',
          description: 'Core overview, motivation, and architectural fundamentals.',
          important_concepts: 'Foundational syntax, core architecture, execution lifecycle',
          difficulty: 'Beginner',
          duration: '45 mins',
          examples: '// Example 1: Getting Started\nconsole.log("Initializing foundational concepts...");',
          display_order: 1,
          learning_objectives: [
            'Define the scope and primary applications of the topic'
          ]
        }
      ]
    }
  ]
};

export default function TeacherCourses({ teacher, currentUser }) {
  // Navigation state:
  // 'list' -> Courses catalog + Create Course entry cards
  // 'entry' -> Dedicated two-choice Create Course screen
  // 'manual_step1' -> Manual Course Creation Step 1 (Basic Information)
  // 'smart_input' -> Smart Course Builder Input Form
  // 'builder' -> Unified 3-Column Visual Course Structure Builder & Review Screen
  const [viewMode, setViewMode] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');

  // Courses list from DB
  const [courses, setCourses] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Active course draft being created/edited in Builder
  const [courseDraft, setCourseDraft] = useState(EMPTY_COURSE_DRAFT);
  const [isJustGeneratedBanner, setIsJustGeneratedBanner] = useState(false);

  // Tree & Center Editor selection inside the 3-column Builder
  // { type: 'course' } | { type: 'module', modIndex: 0 } | { type: 'topic', modIndex: 0, topIndex: 0 }
  const [selectedNode, setSelectedNode] = useState({ type: 'course' });
  const [expandedModules, setExpandedModules] = useState({ 0: true, 1: true, 2: true });

  // Smart Course Builder Input Form State
  const [smartInput, setSmartInput] = useState({
    course_name: '',
    description: '',
    category: 'Programming',
    difficulty: 'Beginner',
    target_audience: 'Undergraduate Computer Science Students',
    duration: '6 Weeks',
    prerequisites: 'Basic computer literacy',
    main_topics: '',
    important_points: '',
    learning_goals: ''
  });

  // Loading & Feedback banners
  const [generatingCourse, setGeneratingCourse] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishingCourse, setPublishingCourse] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Objective input helper states
  const [newCourseObjText, setNewCourseObjText] = useState('');
  const [newModuleObjText, setNewModuleObjText] = useState('');
  const [newTopicObjText, setNewTopicObjText] = useState('');

  // Confirmation Modals
  // 1. Publish Confirmation Modal
  const [showPublishModal, setShowPublishModal] = useState(false);

  // 2. Section Regeneration Confirmation Modal
  // { open: false, sectionType: '', label: '', previewData: null, modIndex: null, topIndex: null }
  const [regenConfirmModal, setRegenConfirmModal] = useState({
    open: false,
    sectionType: '',
    label: '',
    previewData: null,
    modIndex: null,
    topIndex: null
  });

  // Load courses owned by authenticated teacher
  const loadCourses = async () => {
    setLoadingList(true);
    setErrorMsg('');
    try {
      const data = await teacherService.getTeacherCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Course list could not be loaded because the server is unavailable.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const showToastSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => {
      setSuccessMsg((prev) => (prev === msg ? '' : prev));
    }, 5000);
  };

  // =====================================================
  // ENTRY & MODE SWITCHING HANDLERS
  // =====================================================
  const startManualCreation = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsJustGeneratedBanner(false);
    setCourseDraft({
      ...JSON.parse(JSON.stringify(EMPTY_COURSE_DRAFT)),
      creation_method: 'manual',
      status: 'draft'
    });
    setSelectedNode({ type: 'course' });
    setExpandedModules({ 0: true });
    setViewMode('manual_step1');
  };

  const startSmartBuilder = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsJustGeneratedBanner(false);
    setViewMode('smart_input');
  };

  const switchToSmartBuilder = () => {
    const draft = courseDraft;
    const topicNames = (draft.modules || [])
      .flatMap((module) => module.topics || [])
      .map((topic) => topic.topic_name)
      .filter(Boolean);

    setSmartInput((previous) => ({
      ...previous,
      course_name: draft.course_name || previous.course_name,
      description: draft.description || draft.short_description || previous.description,
      category: draft.category || previous.category,
      difficulty: draft.difficulty || previous.difficulty,
      target_audience: draft.target_audience || previous.target_audience,
      duration: draft.duration || previous.duration,
      prerequisites: draft.prerequisites || previous.prerequisites,
      main_topics: topicNames.length > 0 ? topicNames.join('\n') : previous.main_topics,
      learning_goals: (draft.learning_objectives || []).length > 0
        ? draft.learning_objectives.join('\n')
        : previous.learning_goals
    }));
    setErrorMsg('');
    setSuccessMsg('Your current course details were carried into Smart Course Builder.');
    setViewMode('smart_input');
  };

  const switchToManualCreation = () => {
    setCourseDraft((previous) => ({
      ...previous,
      course_name: smartInput.course_name || previous.course_name,
      description: smartInput.description || previous.description,
      short_description: smartInput.description || previous.short_description,
      category: smartInput.category || previous.category,
      difficulty: smartInput.difficulty || previous.difficulty,
      target_audience: smartInput.target_audience || previous.target_audience,
      duration: smartInput.duration || previous.duration,
      prerequisites: smartInput.prerequisites || previous.prerequisites,
      learning_objectives: smartInput.learning_goals
        ? smartInput.learning_goals.split(/[\n,]+/).map((goal) => goal.trim()).filter(Boolean)
        : previous.learning_objectives,
      creation_method: 'manual',
      status: 'draft'
    }));
    setErrorMsg('');
    setSuccessMsg('Your Smart Course Builder inputs were carried into Manual Course Creation.');
    setViewMode('manual_step1');
  };

  const fillPythonPreset = () => {
    setSmartInput({
      course_name: 'Python Programming',
      description: 'Comprehensive hands-on introduction to Python programming, data structures, control flow, and modular software design.',
      category: 'Programming',
      difficulty: 'Beginner',
      target_audience: 'First-year Software Engineering students',
      duration: '6 Weeks',
      prerequisites: 'Basic computer literacy',
      main_topics: 'Variables\nData Types\nConditions\nLoops\nFunctions\nOOP',
      important_points: 'Practical examples\nBeginner friendly\nProgramming exercises',
      learning_goals: 'Write clean Python scripts\nSolve algorithmic challenges using loops and functions\nDesign object-oriented classes'
    });
  };

  const openExistingCourseInBuilder = async (courseSummary) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsJustGeneratedBanner(false);
    try {
      const fullCourse = await teacherService.getTeacherCourseById(courseSummary.id || courseSummary.course_id);
      setCourseDraft(fullCourse);
      const exp = {};
      (fullCourse.modules || []).forEach((_, idx) => {
        exp[idx] = true;
      });
      setExpandedModules(exp);
      setSelectedNode({ type: 'course' });
      setViewMode('builder');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load course structure.');
    }
  };

  // =====================================================
  // MANUAL STEP 1 VALIDATION -> STEP 2 BUILDER
  // =====================================================
  const handleProceedToManualStep2 = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!courseDraft.course_name.trim()) {
      setErrorMsg('Validation Error: Course Name is required.');
      return;
    }
    if (!courseDraft.difficulty) {
      setErrorMsg('Validation Error: Difficulty Level is required.');
      return;
    }
    if (!courseDraft.learning_objectives || courseDraft.learning_objectives.length === 0) {
      setErrorMsg('Validation Warning: Please add at least one Learning Objective before building your course structure.');
      return;
    }

    setSelectedNode({ type: 'module', modIndex: 0 });
    setExpandedModules({ 0: true });
    setViewMode('builder');
    showToastSuccess('Step 1 verified! Now customize your modules and topics in the Course Structure Builder.');
  };

  // =====================================================
  // SMART COURSE BUILDER GENERATION
  // =====================================================
  const handleGenerateSmartDraft = async (e) => {
    e.preventDefault();
    if (generatingCourse) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!smartInput.course_name.trim()) {
      setErrorMsg('Validation Error: Course Name is required to generate a course draft.');
      return;
    }
    if (!smartInput.difficulty) {
      setErrorMsg('Validation Error: Difficulty is required.');
      return;
    }

    setGeneratingCourse(true);
    try {
      const res = await teacherService.generateCourseDraft(smartInput);
      if (!res || !res.draft || !Array.isArray(res.draft.modules)) {
        throw new Error('Unable to generate the course draft. Please try again.');
      }

      const existingModules = Array.isArray(courseDraft.modules) ? courseDraft.modules : [];
      const mergedModules = res.draft.modules.map((generatedModule, moduleIndex) => {
        const existingModule = existingModules[moduleIndex];
        if (!existingModule) return generatedModule;

        const generatedTopicNames = new Set(
          (generatedModule.topics || []).map((topic) => (topic.topic_name || '').trim().toLowerCase())
        );
        const preservedTopics = (existingModule.topics || []).filter((topic) => {
          const topicName = (topic.topic_name || '').trim().toLowerCase();
          return topicName && !generatedTopicNames.has(topicName);
        });

        return {
          ...generatedModule,
          topics: [...preservedTopics, ...(generatedModule.topics || [])]
        };
      });

      const generated = {
        ...res.draft,
        id: courseDraft.id || courseDraft.course_id || null,
        status: 'draft',
        creation_method: 'smart',
        modules: [
          ...mergedModules,
          ...existingModules.slice(res.draft.modules.length)
        ]
      };

      setCourseDraft(generated);
      const exp = {};
      generated.modules.forEach((_, idx) => {
        exp[idx] = true;
      });
      setExpandedModules(exp);
      setSelectedNode({ type: 'course' });
      setIsJustGeneratedBanner(true);
      setViewMode('builder');
      showToastSuccess('Course draft is ready for review. Inspect and edit below, then click Save Draft.');
    } catch (err) {
      setErrorMsg(err.message || 'Unable to generate the course draft. Please try again.');
    } finally {
      setGeneratingCourse(false);
    }
  };

  // =====================================================
  // SAVE DRAFT, PUBLISH, DUPLICATE, ARCHIVE, DELETE
  // =====================================================
  const handleSaveDraft = async () => {
    if (savingDraft) return;
    setErrorMsg('');

    if (!courseDraft.course_name.trim()) {
      setErrorMsg('Validation Error: Course Name is required before saving a draft.');
      return;
    }
    if (!courseDraft.difficulty) {
      setErrorMsg('Validation Error: Difficulty Level is required.');
      return;
    }

    setSavingDraft(true);
    try {
      const res = await teacherService.saveCourseDraft({
        ...courseDraft,
        status: 'draft',
        force_draft: true
      });
      if (res && res.course) {
        setCourseDraft(res.course);
        setIsJustGeneratedBanner(false);
      }
      await loadCourses();
      showToastSuccess(res.message || 'Course saved as draft successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Course could not be saved because the database is unavailable.');
    } finally {
      setSavingDraft(false);
    }
  };

  // Publish Readiness Validation Checklist
  const getPublishValidation = (draft = courseDraft) => {
    const hasName = Boolean(draft.course_name && draft.course_name.trim().length > 0);
    const hasDesc = Boolean((draft.description && draft.description.trim().length > 0) || (draft.short_description && draft.short_description.trim().length > 0));
    const modules = Array.isArray(draft.modules) ? draft.modules : [];
    const hasAtLeastOneModule = modules.length > 0;
    const allModulesHaveValidNames = hasAtLeastOneModule && modules.every((m) => Boolean(m.module_name && m.module_name.trim().length > 0));

    let totalTopics = 0;
    let allTopicsHaveValidNames = true;
    modules.forEach((m) => {
      const tops = Array.isArray(m.topics) ? m.topics : [];
      totalTopics += tops.length;
      tops.forEach((t) => {
        if (!t.topic_name || !t.topic_name.trim()) {
          allTopicsHaveValidNames = false;
        }
      });
    });

    const hasAtLeastOneTopic = totalTopics > 0;
    const hasObjectives = Array.isArray(draft.learning_objectives) && draft.learning_objectives.length > 0;
    const isSavedInDb = Boolean(draft.id || draft.course_id);

    const canPublish =
      isSavedInDb &&
      hasName &&
      hasDesc &&
      hasAtLeastOneModule &&
      allModulesHaveValidNames &&
      hasAtLeastOneTopic &&
      allTopicsHaveValidNames;

    return {
      isSavedInDb,
      hasName,
      hasDesc,
      hasAtLeastOneModule,
      allModulesHaveValidNames,
      hasAtLeastOneTopic,
      allTopicsHaveValidNames,
      hasObjectives,
      totalModules: modules.length,
      totalTopics,
      canPublish
    };
  };

  const handleOpenPublishConfirmation = () => {
    setErrorMsg('');
    const check = getPublishValidation(courseDraft);
    if (!check.isSavedInDb) {
      setErrorMsg('Please click "Save Draft" first after reviewing your course before publishing.');
      return;
    }
    if (!check.canPublish) {
      setErrorMsg('Cannot publish yet: Please complete all required validation checklist items on the right panel.');
      return;
    }
    setShowPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    if (publishingCourse) return;
    setPublishingCourse(true);
    setErrorMsg('');
    try {
      const res = await teacherService.publishCourse(courseDraft);
      if (res && res.course) {
        setCourseDraft(res.course);
      }
      setShowPublishModal(false);
      await loadCourses();
      showToastSuccess(res.message || 'Course published successfully!');
    } catch (err) {
      setShowPublishModal(false);
      setErrorMsg(err.message || 'Failed to publish course.');
    } finally {
      setPublishingCourse(false);
    }
  };

  const handleDuplicateCourse = async (courseIdToDup) => {
    const targetId = courseIdToDup || courseDraft.id || courseDraft.course_id;
    if (!targetId) {
      setErrorMsg('Save the course draft first before duplicating.');
      return;
    }
    try {
      const res = await teacherService.duplicateBuilderCourse(targetId);
      await loadCourses();
      if (res && res.course) {
        setCourseDraft(res.course);
        setSelectedNode({ type: 'course' });
        setViewMode('builder');
      }
      showToastSuccess(res.message || 'Course duplicated as a new draft!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to duplicate course.');
    }
  };

  const handleArchiveCourse = async (courseIdToArch) => {
    const targetId = courseIdToArch || courseDraft.id || courseDraft.course_id;
    if (!targetId) return;
    try {
      const res = await teacherService.archiveCourse(targetId);
      if (res && res.course && (courseDraft.id === targetId || courseDraft.course_id === targetId)) {
        setCourseDraft(res.course);
      }
      await loadCourses();
      showToastSuccess('Course moved to archived status.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to archive course.');
    }
  };

  const handleDeleteCourse = async (courseIdToDel, courseTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${courseTitle}" and all its modules and topics?`)) {
      return;
    }
    try {
      await teacherService.deleteBuilderCourse(courseIdToDel);
      await loadCourses();
      if (viewMode === 'builder' && (courseDraft.id === courseIdToDel || courseDraft.course_id === courseIdToDel)) {
        setViewMode('list');
      }
      showToastSuccess(`Deleted course "${courseTitle}".`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete course.');
    }
  };

  // =====================================================
  // SECTION-LEVEL REGENERATION WITH CONFIRMATION MODAL
  // =====================================================
  const requestSectionRegeneration = async (sectionType, modIndex = null, topIndex = null) => {
    if (regeneratingSection) return;
    setRegeneratingSection(true);
    setErrorMsg('');

    try {
      const payload = {
        course_name: courseDraft.course_name || 'Academic Course',
        category: courseDraft.category || 'Computer Science',
        difficulty: courseDraft.difficulty || 'Beginner',
        duration: courseDraft.duration || '6 Weeks',
        target_audience: courseDraft.target_audience || 'Students',
        prerequisites: courseDraft.prerequisites || '',
        description: courseDraft.short_description || ''
      };

      let label = 'Entire Course Structure';
      if (sectionType === 'description') {
        label = 'Course Description';
      } else if (sectionType === 'objectives') {
        label = 'Course Learning Objectives';
      } else if (sectionType === 'module' && modIndex !== null) {
        const mod = courseDraft.modules[modIndex];
        payload.module_name = mod?.module_name || `Module ${modIndex + 1}`;
        payload.difficulty = mod?.difficulty || courseDraft.difficulty;
        label = `Module: "${payload.module_name}"`;
      } else if (sectionType === 'topic' && modIndex !== null && topIndex !== null) {
        const mod = courseDraft.modules[modIndex];
        const top = mod?.topics?.[topIndex];
        payload.module_name = mod?.module_name || `Module ${modIndex + 1}`;
        payload.topic_name = top?.topic_name || `Topic ${topIndex + 1}`;
        payload.difficulty = top?.difficulty || mod?.difficulty || courseDraft.difficulty;
        label = `Topic: "${payload.topic_name}"`;
      }

      const res = await teacherService.regenerateCourseSection(sectionType, payload);
      if (!res || !res.generated) {
        throw new Error('Unable to generate replacement section. Please try again.');
      }

      setRegenConfirmModal({
        open: true,
        sectionType,
        label,
        previewData: res.generated,
        modIndex,
        topIndex
      });
    } catch (err) {
      setErrorMsg(err.message || 'Section regeneration failed.');
    } finally {
      setRegeneratingSection(false);
    }
  };

  const confirmApplyRegeneratedSection = () => {
    const { sectionType, previewData, modIndex, topIndex, label } = regenConfirmModal;
    if (!previewData) return;

    const updated = JSON.parse(JSON.stringify(courseDraft));

    if (sectionType === 'description') {
      updated.short_description = previewData.short_description || updated.short_description;
      updated.description = previewData.description || updated.description;
    } else if (sectionType === 'objectives') {
      updated.learning_objectives = Array.isArray(previewData.learning_objectives)
        ? previewData.learning_objectives
        : updated.learning_objectives;
    } else if (sectionType === 'module' && modIndex !== null && updated.modules[modIndex]) {
      updated.modules[modIndex] = {
        ...updated.modules[modIndex],
        module_name: previewData.module_name || updated.modules[modIndex].module_name,
        description: previewData.description || '',
        difficulty: previewData.difficulty || updated.modules[modIndex].difficulty,
        duration: previewData.duration || '2 Weeks',
        learning_objectives: previewData.learning_objectives || [],
        topics: Array.isArray(previewData.topics) ? previewData.topics : updated.modules[modIndex].topics
      };
    } else if (
      sectionType === 'topic' &&
      modIndex !== null &&
      topIndex !== null &&
      updated.modules[modIndex]?.topics?.[topIndex]
    ) {
      updated.modules[modIndex].topics[topIndex] = {
        ...updated.modules[modIndex].topics[topIndex],
        topic_name: previewData.topic_name || updated.modules[modIndex].topics[topIndex].topic_name,
        description: previewData.description || '',
        important_concepts: previewData.important_concepts || '',
        difficulty: previewData.difficulty || updated.modules[modIndex].topics[topIndex].difficulty,
        duration: previewData.duration || '45 mins',
        learning_objectives: previewData.learning_objectives || [],
        examples: previewData.examples || ''
      };
    } else if (sectionType === 'course') {
      updated.short_description = previewData.short_description || updated.short_description;
      updated.description = previewData.description || updated.description;
      updated.learning_objectives = previewData.learning_objectives || updated.learning_objectives;
      updated.modules = previewData.modules || updated.modules;
    }

    setCourseDraft(updated);
    setRegenConfirmModal({ open: false, sectionType: '', label: '', previewData: null, modIndex: null, topIndex: null });
    showToastSuccess(`Replaced ${label} with newly generated version!`);
  };

  // =====================================================
  // TREE & STRUCTURE MANIPULATION HELPERS
  // =====================================================
  const updateCourseField = (field, value) => {
    setCourseDraft((prev) => ({ ...prev, [field]: value }));
  };

  // Course Objectives
  const addCourseObjective = () => {
    const val = newCourseObjText.trim();
    if (!val) return;
    const exists = (courseDraft.learning_objectives || []).some((o) => o.toLowerCase() === val.toLowerCase());
    if (exists) {
      setErrorMsg('Duplicate objective: This learning objective already exists.');
      return;
    }
    setCourseDraft((prev) => ({
      ...prev,
      learning_objectives: [...(prev.learning_objectives || []), val]
    }));
    setNewCourseObjText('');
  };

  const updateCourseObjective = (idx, val) => {
    const list = [...(courseDraft.learning_objectives || [])];
    list[idx] = val;
    setCourseDraft((prev) => ({ ...prev, learning_objectives: list }));
  };

  const removeCourseObjective = (idx) => {
    const list = (courseDraft.learning_objectives || []).filter((_, i) => i !== idx);
    setCourseDraft((prev) => ({ ...prev, learning_objectives: list }));
  };

  // Modules Manipulation
  const addModule = () => {
    const nextNum = (courseDraft.modules?.length || 0) + 1;
    const newMod = {
      module_name: `Module ${nextNum}: New Module`,
      description: 'Enter module overview and scope.',
      difficulty: courseDraft.difficulty || 'Beginner',
      duration: '1 Week',
      display_order: nextNum,
      learning_objectives: ['Master core concepts introduced in this module'],
      topics: [
        {
          topic_name: `Topic 1: Introduction to Module ${nextNum}`,
          description: 'Core concepts and examples.',
          important_concepts: 'Key terminology and mechanics',
          difficulty: courseDraft.difficulty || 'Beginner',
          duration: '45 mins',
          examples: '// Guided example code or key points',
          display_order: 1,
          learning_objectives: ['Explain the primary concepts of this topic']
        }
      ]
    };

    const newIndex = courseDraft.modules?.length || 0;
    setCourseDraft((prev) => ({
      ...prev,
      modules: [...(prev.modules || []), newMod]
    }));
    setExpandedModules((prev) => ({ ...prev, [newIndex]: true }));
    setSelectedNode({ type: 'module', modIndex: newIndex });
  };

  const deleteModule = (mIdx) => {
    if ((courseDraft.modules?.length || 0) <= 1) {
      setErrorMsg('A course should have at least one module. Edit the existing module instead.');
      return;
    }
    if (!window.confirm(`Delete "${courseDraft.modules[mIdx].module_name}" and all its topics?`)) return;
    const updatedMods = courseDraft.modules.filter((_, i) => i !== mIdx);
    setCourseDraft((prev) => ({ ...prev, modules: updatedMods }));
    setSelectedNode({ type: 'course' });
  };

  const moveModule = (mIdx, direction) => {
    const targetIdx = mIdx + direction;
    if (targetIdx < 0 || targetIdx >= courseDraft.modules.length) return;
    const mods = [...courseDraft.modules];
    const temp = mods[mIdx];
    mods[mIdx] = mods[targetIdx];
    mods[targetIdx] = temp;
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
    setSelectedNode({ type: 'module', modIndex: targetIdx });
  };

  const updateModuleField = (mIdx, field, value) => {
    const mods = [...(courseDraft.modules || [])];
    if (!mods[mIdx]) return;
    mods[mIdx] = { ...mods[mIdx], [field]: value };
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
  };

  const addModuleObjective = (mIdx) => {
    const val = newModuleObjText.trim();
    if (!val) return;
    const mods = [...(courseDraft.modules || [])];
    const curr = mods[mIdx].learning_objectives || [];
    if (curr.some((o) => o.toLowerCase() === val.toLowerCase())) {
      setErrorMsg('Duplicate objective in this module.');
      return;
    }
    mods[mIdx].learning_objectives = [...curr, val];
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
    setNewModuleObjText('');
  };

  const updateModuleObjective = (mIdx, oIdx, value) => {
    const mods = [...(courseDraft.modules || [])];
    const objs = [...(mods[mIdx].learning_objectives || [])];
    objs[oIdx] = value;
    mods[mIdx].learning_objectives = objs;
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
  };

  const removeModuleObjective = (mIdx, oIdx) => {
    const mods = [...(courseDraft.modules || [])];
    mods[mIdx].learning_objectives = (mods[mIdx].learning_objectives || []).filter((_, i) => i !== oIdx);
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
  };

  // Topics Manipulation
  const addTopicToModule = (mIdx) => {
    const mods = [...(courseDraft.modules || [])];
    const currTopics = mods[mIdx]?.topics || [];
    const nextNum = currTopics.length + 1;
    const newTop = {
      topic_name: `Topic ${nextNum}: New Topic`,
      description: 'Detailed explanation of topic concepts.',
      important_concepts: 'Core definitions, syntax, and patterns',
      difficulty: mods[mIdx].difficulty || courseDraft.difficulty || 'Beginner',
      duration: '45 mins',
      examples: '// Example usage and key points',
      display_order: nextNum,
      learning_objectives: ['Apply concepts from this topic in practical exercises']
    };
    mods[mIdx].topics = [...currTopics, newTop];
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
    setExpandedModules((prev) => ({ ...prev, [mIdx]: true }));
    setSelectedNode({ type: 'topic', modIndex: mIdx, topIndex: currTopics.length });
  };

  const deleteTopic = (mIdx, tIdx) => {
    const mods = [...(courseDraft.modules || [])];
    const tName = mods[mIdx]?.topics?.[tIdx]?.topic_name || 'Topic';
    if (!window.confirm(`Delete topic "${tName}"?`)) return;
    mods[mIdx].topics = mods[mIdx].topics.filter((_, i) => i !== tIdx);
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
    setSelectedNode({ type: 'module', modIndex: mIdx });
  };

  const moveTopicWithinModule = (mIdx, tIdx, direction) => {
    const mods = [...(courseDraft.modules || [])];
    const tops = [...(mods[mIdx].topics || [])];
    const targetIdx = tIdx + direction;
    if (targetIdx < 0 || targetIdx >= tops.length) return;
    const temp = tops[tIdx];
    tops[tIdx] = tops[targetIdx];
    tops[targetIdx] = temp;
    mods[mIdx].topics = tops;
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
    setSelectedNode({ type: 'topic', modIndex: mIdx, topIndex: targetIdx });
  };

  const moveTopicToAnotherModule = (fromModIdx, topIdx, toModIdx) => {
    const destIdx = Number(toModIdx);
    if (destIdx === fromModIdx || destIdx < 0 || destIdx >= courseDraft.modules.length) return;
    const mods = JSON.parse(JSON.stringify(courseDraft.modules));
    const [movedTopic] = mods[fromModIdx].topics.splice(topIdx, 1);
    mods[destIdx].topics.push(movedTopic);
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
    setExpandedModules((prev) => ({ ...prev, [destIdx]: true }));
    setSelectedNode({
      type: 'topic',
      modIndex: destIdx,
      topIndex: mods[destIdx].topics.length - 1
    });
    showToastSuccess(`Moved "${movedTopic.topic_name}" to "${mods[destIdx].module_name}".`);
  };

  const updateTopicField = (mIdx, tIdx, field, value) => {
    const mods = [...(courseDraft.modules || [])];
    const tops = [...(mods[mIdx].topics || [])];
    tops[tIdx] = { ...tops[tIdx], [field]: value };
    mods[mIdx].topics = tops;
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
  };

  const addTopicObjective = (mIdx, tIdx) => {
    const val = newTopicObjText.trim();
    if (!val) return;
    const mods = [...(courseDraft.modules || [])];
    const tops = [...(mods[mIdx].topics || [])];
    const curr = tops[tIdx].learning_objectives || [];
    if (curr.some((o) => o.toLowerCase() === val.toLowerCase())) {
      setErrorMsg('Duplicate learning objective in this topic.');
      return;
    }
    tops[tIdx].learning_objectives = [...curr, val];
    mods[mIdx].topics = tops;
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
    setNewTopicObjText('');
  };

  const updateTopicObjective = (mIdx, tIdx, oIdx, value) => {
    const mods = [...(courseDraft.modules || [])];
    const tops = [...(mods[mIdx].topics || [])];
    const objs = [...(tops[tIdx].learning_objectives || [])];
    objs[oIdx] = value;
    tops[tIdx].learning_objectives = objs;
    mods[mIdx].topics = tops;
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
  };

  const removeTopicObjective = (mIdx, tIdx, oIdx) => {
    const mods = [...(courseDraft.modules || [])];
    const tops = [...(mods[mIdx].topics || [])];
    tops[tIdx].learning_objectives = (tops[tIdx].learning_objectives || []).filter((_, i) => i !== oIdx);
    mods[mIdx].topics = tops;
    setCourseDraft((prev) => ({ ...prev, modules: mods }));
  };

  // Helper badge styles
  const getStatusBadgeStyle = (status) => {
    const s = (status || 'draft').toLowerCase();
    if (s === 'published') {
      return { bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.35)', color: '#10b981', label: 'Published' };
    }
    if (s === 'archived') {
      return { bg: 'rgba(148, 163, 184, 0.14)', border: 'rgba(148, 163, 184, 0.3)', color: '#94a3b8', label: 'Archived' };
    }
    return { bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.35)', color: '#f59e0b', label: 'Draft' };
  };

  const filteredCourses = courses.filter((c) => {
    if (statusFilter === 'all') return true;
    return (c.status || 'draft').toLowerCase() === statusFilter;
  });

  const publishCheck = getPublishValidation(courseDraft);

  // =====================================================================
  // RENDER
  // =====================================================================
  return (
    <div className="animate-fade-in" style={styles.pageContainer}>
      {/* Global Feedback Alerts */}
      {errorMsg && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flexGrow: 1 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={styles.bannerCloseBtn}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div style={styles.successBanner}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ flexGrow: 1 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={styles.bannerCloseBtn}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ===============================================================
          VIEW 1 & ENTRY: COURSE CREATION ENTRY + MY COURSES CATALOG
      =============================================================== */}
      {(viewMode === 'list' || viewMode === 'entry') && (
        <>
          <div style={styles.topHeaderRow}>
            <div>
              <h2 style={styles.pageTitle}>Create Course & Curriculum Management</h2>
              <p style={styles.pageSubtitle}>
                Build structured courses manually or use the Smart Course Builder to prepare editable course drafts.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={loadCourses} style={styles.secondaryBtn}>
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'entry' ? 'list' : 'entry')}
                style={styles.primaryBtn}
              >
                <Plus size={16} />
                <span>Create Course</span>
              </button>
            </div>
          </div>

          {/* 1. COURSE CREATION ENTRY — TWO CHOICES */}
          <div style={styles.entryChoicesGrid}>
            {/* Choice 1: Manual Course Creation */}
            <div style={styles.entryChoiceCard} onClick={startManualCreation}>
              <div style={styles.entryIconBoxManual}>
                <Layers size={26} color="var(--primary)" />
              </div>
              <div style={styles.entryCardContent}>
                <div style={styles.entryBadgeRow}>
                  <span style={styles.methodBadgeManual}>Full Manual Control</span>
                </div>
                <h3 style={styles.entryCardTitle}>Manual Course Creation</h3>
                <p style={styles.entryCardDesc}>
                  Create the complete course structure yourself. Define course metadata, learning objectives, modules, and topics step by step.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startManualCreation();
                  }}
                  style={styles.entryActionBtnManual}
                >
                  <span>Start Manual Course Creation</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Choice 2: Smart Course Builder */}
            <div style={styles.entryChoiceCardSmart} onClick={startSmartBuilder}>
              <div style={styles.entryIconBoxSmart}>
                <Sparkles size={26} color="#38bdf8" />
              </div>
              <div style={styles.entryCardContent}>
                <div style={styles.entryBadgeRow}>
                  <span style={styles.methodBadgeSmart}>AI-Assisted Course Builder</span>
                </div>
                <h3 style={styles.entryCardTitle}>Smart Course Builder</h3>
                <p style={styles.entryCardDesc}>
                  Enter basic course information and let the system prepare a complete course structure draft that you can review, regenerate by section, and edit before saving.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startSmartBuilder();
                  }}
                  style={styles.entryActionBtnSmart}
                >
                  <Sparkles size={16} />
                  <span>Launch Smart Course Builder</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Existing Teacher Courses Catalog */}
          {viewMode === 'list' && (
            <div style={styles.catalogSection}>
              <div style={styles.catalogHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={styles.sectionTitle}>My Managed Courses ({filteredCourses.length})</h3>
                </div>

                {/* Filter Pills */}
                <div style={styles.filterTabs}>
                  {[
                    { key: 'all', label: 'All Courses' },
                    { key: 'draft', label: 'Drafts' },
                    { key: 'published', label: 'Published' },
                    { key: 'archived', label: 'Archived' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      style={{
                        ...styles.filterTabBtn,
                        ...(statusFilter === tab.key ? styles.filterTabBtnActive : {})
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingList ? (
                <div style={styles.loadingCard}>
                  <RefreshCw size={24} className="animate-spin" color="var(--primary)" />
                  <span>Loading your courses from database...</span>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div style={styles.emptyCard}>
                  <BookOpen size={42} color="var(--text-muted)" />
                  <h4 style={{ margin: '8px 0 4px', color: 'var(--text-primary)' }}>No courses found in this view</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Choose "Manual Course Creation" or "Smart Course Builder" above to create a new course.
                  </p>
                </div>
              ) : (
                <div style={styles.coursesGrid}>
                  {filteredCourses.map((c) => {
                    const badge = getStatusBadgeStyle(c.status);
                    const isSmart = c.creation_method === 'smart';
                    return (
                      <div key={c.id || c.course_id} style={styles.courseCard}>
                        <div style={styles.courseCardTop}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={styles.codePill}>{c.course_code || 'CS-101'}</span>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: badge.bg,
                                borderColor: badge.border,
                                color: badge.color
                              }}
                            >
                              {badge.label}
                            </span>
                            <span style={isSmart ? styles.creationTagSmart : styles.creationTagManual}>
                              {isSmart ? 'Smart Builder' : 'Manual'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleDuplicateCourse(c.id || c.course_id)}
                              style={styles.iconBtn}
                              title="Duplicate Course as Draft"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id || c.course_id, c.course_name)}
                              style={{ ...styles.iconBtn, color: 'var(--danger)' }}
                              title="Delete Course"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <h4 style={styles.courseCardTitle}>{c.course_name}</h4>
                        <p style={styles.courseCardDesc}>
                          {c.short_description || c.description || 'No description provided.'}
                        </p>

                        <div style={styles.courseMetaRow}>
                          <span style={styles.metaChip}>
                            <Award size={13} /> {c.difficulty || 'Beginner'}
                          </span>
                          <span style={styles.metaChip}>
                            <Clock size={13} /> {c.duration || '6 Weeks'}
                          </span>
                          <span style={styles.metaChip}>
                            <Layers size={13} /> {c.total_modules || (c.modules ? c.modules.length : 0)} Modules
                          </span>
                          <span style={styles.metaChip}>
                            <FileText size={13} /> {c.total_topics || 0} Topics
                          </span>
                        </div>

                        <div style={styles.courseCardActions}>
                          <button
                            onClick={() => openExistingCourseInBuilder(c)}
                            style={styles.openBuilderBtn}
                          >
                            <Edit3 size={15} />
                            <span>Open in Course Builder</span>
                          </button>

                          {(c.status || 'draft').toLowerCase() === 'draft' ? (
                            <button
                              onClick={async () => {
                                await openExistingCourseInBuilder(c);
                              }}
                              style={styles.reviewPublishBtn}
                              title="Review & Publish"
                            >
                              <Send size={14} />
                              <span>Review & Publish</span>
                            </button>
                          ) : (c.status || '').toLowerCase() === 'published' ? (
                            <button
                              onClick={() => handleArchiveCourse(c.id || c.course_id)}
                              style={styles.archiveSmallBtn}
                              title="Archive Course"
                            >
                              <Archive size={14} />
                              <span>Archive</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===============================================================
          VIEW 2: MANUAL COURSE CREATION — STEP 1 (BASIC INFORMATION)
      =============================================================== */}
      {viewMode === 'manual_step1' && (
        <div style={styles.formViewWrapper}>
          {/* Method Switcher Bar */}
          <div style={styles.methodSwitcherBar}>
            <button
              onClick={() => setViewMode('list')}
              style={styles.backLinkBtn}
            >
              <ArrowLeft size={16} />
              <span>Back to Courses</span>
            </button>

            <div style={styles.switcherPills}>
              <button style={styles.switcherBtnActive}>
                <Layers size={15} />
                <span>Manual Course Creation</span>
              </button>
              <button onClick={switchToSmartBuilder} style={styles.switcherBtn}>
                <Sparkles size={15} />
                <span>Switch to Smart Course Builder</span>
              </button>
            </div>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div>
                <span style={styles.stepBadge}>STEP 1 OF 2 — BASIC INFORMATION</span>
                <h3 style={styles.stepTitle}>Manual Course Creation — Course Details & Objectives</h3>
                <p style={styles.stepSub}>
                  Enter the foundational course metadata and learning objectives. In Step 2, you will build modules and topics visually.
                </p>
              </div>
            </div>

            <form onSubmit={handleProceedToManualStep2} style={styles.formGrid}>
              <div style={styles.formRow2}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Course Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Python Programming"
                    value={courseDraft.course_name}
                    onChange={(e) => updateCourseField('course_name', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g., PY-101"
                    value={courseDraft.course_code}
                    onChange={(e) => updateCourseField('course_code', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow3}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Programming, DBMS, Web Dev"
                    value={courseDraft.category}
                    onChange={(e) => updateCourseField('category', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Difficulty Level *</label>
                  <select
                    value={courseDraft.difficulty}
                    onChange={(e) => updateCourseField('difficulty', e.target.value)}
                    style={styles.input}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 6 Weeks"
                    value={courseDraft.duration}
                    onChange={(e) => updateCourseField('duration', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Short Description</label>
                <input
                  type="text"
                  placeholder="Concise 1-2 sentence summary for course cards..."
                  value={courseDraft.short_description}
                  onChange={(e) => updateCourseField('short_description', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed overview of course scope, methodology, and outcomes..."
                  value={courseDraft.description}
                  onChange={(e) => updateCourseField('description', e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formRow2}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Course Prerequisites</label>
                  <input
                    type="text"
                    placeholder="e.g., Basic computer literacy, High school algebra"
                    value={courseDraft.prerequisites}
                    onChange={(e) => updateCourseField('prerequisites', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g., First-year Computer Science students"
                    value={courseDraft.target_audience}
                    onChange={(e) => updateCourseField('target_audience', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Dynamic Learning Objectives */}
              <div style={styles.objectivesBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={styles.label}>
                    Course Learning Objectives ({courseDraft.learning_objectives?.length || 0})
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    At least 1 learning objective recommended
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {(courseDraft.learning_objectives || []).map((obj, idx) => (
                    <div key={idx} style={styles.objectiveRow}>
                      <span style={styles.objectiveIndex}>✓</span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => updateCourseObjective(idx, e.target.value)}
                        style={styles.objectiveInput}
                      />
                      <button
                        type="button"
                        onClick={() => removeCourseObjective(idx)}
                        style={styles.removeObjBtn}
                        title="Remove objective"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter a new measurable learning objective..."
                    value={newCourseObjText}
                    onChange={(e) => setNewCourseObjText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCourseObjective();
                      }
                    }}
                    style={{ ...styles.input, flexGrow: 1 }}
                  />
                  <button type="button" onClick={addCourseObjective} style={styles.secondaryBtn}>
                    <Plus size={16} />
                    <span>Add Learning Objective</span>
                  </button>
                </div>
              </div>

              <div style={styles.stepFooter}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  style={styles.secondaryBtn}
                >
                  <Save size={16} />
                  <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>

                <button type="submit" style={styles.primaryBtn}>
                  <span>Continue to Step 2: Visual Course Structure Builder</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===============================================================
          VIEW 3: SMART COURSE BUILDER — INPUT WORKFLOW
      =============================================================== */}
      {viewMode === 'smart_input' && (
        <div style={styles.formViewWrapper}>
          {/* Method Switcher Bar */}
          <div style={styles.methodSwitcherBar}>
            <button onClick={() => setViewMode('list')} style={styles.backLinkBtn}>
              <ArrowLeft size={16} />
              <span>Back to Courses</span>
            </button>

            <div style={styles.switcherPills}>
              <button onClick={switchToManualCreation} style={styles.switcherBtn}>
                <Layers size={15} />
                <span>Switch to Manual Course Creation</span>
              </button>
              <button style={styles.switcherBtnActiveSmart}>
                <Sparkles size={15} />
                <span>Smart Course Builder</span>
              </button>
            </div>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div>
                <span style={styles.stepBadgeSmart}>SMART COURSE BUILDER</span>
                <h3 style={styles.stepTitle}>Prepare Structured Course Draft</h3>
                <p style={styles.stepSub}>
                  Provide key course inputs below. The Smart Course Builder will organize modules, topics, concepts, examples, and learning objectives into a draft for your review.
                </p>
              </div>
              <button type="button" onClick={fillPythonPreset} style={styles.presetBtn}>
                <Sparkles size={14} />
                <span>Fill Example: Python Programming</span>
              </button>
            </div>

            {generatingCourse ? (
              <div style={styles.generatingLoaderBox}>
                <RefreshCw size={38} className="animate-spin" color="#38bdf8" />
                <h3 style={{ margin: '14px 0 6px', color: 'var(--text-primary)' }}>
                  Preparing your course structure...
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', textAlign: 'center' }}>
                  Organizing modules, structuring topic progressions, formulating learning objectives, and preparing example suggestions. This will open in Draft mode for your review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleGenerateSmartDraft} style={styles.formGrid}>
                <div style={styles.formRow3}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Course Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Python Programming"
                      value={smartInput.course_name}
                      onChange={(e) => setSmartInput({ ...smartInput, course_name: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Subject / Category</label>
                    <input
                      type="text"
                      placeholder="e.g., Programming"
                      value={smartInput.category}
                      onChange={(e) => setSmartInput({ ...smartInput, category: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Difficulty *</label>
                    <select
                      value={smartInput.difficulty}
                      onChange={(e) => setSmartInput({ ...smartInput, difficulty: e.target.value })}
                      style={styles.input}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formRow3}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Estimated Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 6 Weeks"
                      value={smartInput.duration}
                      onChange={(e) => setSmartInput({ ...smartInput, duration: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Target Audience</label>
                    <input
                      type="text"
                      placeholder="e.g., First-year Engineering Students"
                      value={smartInput.target_audience}
                      onChange={(e) => setSmartInput({ ...smartInput, target_audience: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Prerequisites</label>
                    <input
                      type="text"
                      placeholder="e.g., Basic computer literacy"
                      value={smartInput.prerequisites}
                      onChange={(e) => setSmartInput({ ...smartInput, prerequisites: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Course Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief overview of what this course covers..."
                    value={smartInput.description}
                    onChange={(e) => setSmartInput({ ...smartInput, description: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formRow3}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Main Topics (one per line or comma-separated)</label>
                    <textarea
                      rows={5}
                      placeholder={"Variables\nData Types\nConditions\nLoops\nFunctions\nOOP"}
                      value={smartInput.main_topics}
                      onChange={(e) => setSmartInput({ ...smartInput, main_topics: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Important Points / Teaching Style</label>
                    <textarea
                      rows={5}
                      placeholder={"Practical examples\nBeginner friendly\nProgramming exercises"}
                      value={smartInput.important_points}
                      onChange={(e) => setSmartInput({ ...smartInput, important_points: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Learning Goals</label>
                    <textarea
                      rows={5}
                      placeholder={"Master core syntax\nBuild modular programs\nSolve practical coding problems"}
                      value={smartInput.learning_goals}
                      onChange={(e) => setSmartInput({ ...smartInput, learning_goals: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>
                </div>

                <div style={styles.stepFooter}>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    style={styles.secondaryBtn}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={generatingCourse}
                    style={styles.smartGenerateBtn}
                  >
                    <Sparkles size={17} />
                    <span>Generate Course Draft</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===============================================================
          VIEW 4: UNIFIED 3-COLUMN COURSE STRUCTURE BUILDER & REVIEW SCREEN
      =============================================================== */}
      {viewMode === 'builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Navigation & Mode Switcher */}
          <div style={styles.builderTopBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setViewMode('list')} style={styles.backLinkBtn}>
                <ArrowLeft size={16} />
                <span>Back to Courses</span>
              </button>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {courseDraft.course_name || 'Untitled Course'}
              </span>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusBadgeStyle(courseDraft.status).bg,
                  borderColor: getStatusBadgeStyle(courseDraft.status).border,
                  color: getStatusBadgeStyle(courseDraft.status).color
                }}
              >
                {getStatusBadgeStyle(courseDraft.status).label}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => requestSectionRegeneration('course')}
                disabled={regeneratingSection}
                style={styles.regenOutlineBtn}
                title="Regenerate Entire Course Structure"
              >
                <RefreshCw size={14} className={regeneratingSection ? 'animate-spin' : ''} />
                <span>Regenerate Section / Course</span>
              </button>

              <button
                onClick={switchToSmartBuilder}
                style={styles.regenOutlineBtn}
                title="Continue this draft with Smart Course Builder"
              >
                <Sparkles size={14} />
                <span>Switch to Smart Builder</span>
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={savingDraft}
                style={styles.primaryBtn}
              >
                <Save size={15} />
                <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
              </button>
            </div>
          </div>

          {/* REVIEW AND EDIT BANNER (Shown after Smart Course Generation) */}
          {isJustGeneratedBanner && (
            <div style={styles.draftGeneratedBanner}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={styles.draftBannerIcon}>
                  <Sparkles size={20} color="#38bdf8" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                    Course Draft Generated — Ready for Teacher Review & Editing
                  </h4>
                  <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    This course is currently a <strong>Draft</strong> and has <strong>not</strong> been published. Review and edit any module or topic below, regenerate specific sections, and click <strong>Save Draft</strong> to unlock publishing.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => setSelectedNode({ type: 'course' })}
                  style={styles.secondaryBtn}
                >
                  <Edit3 size={14} />
                  <span>Edit Course</span>
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  style={styles.primaryBtn}
                >
                  <Save size={14} />
                  <span>Save Draft</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={styles.secondaryBtn}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* 3-COLUMN COURSE BUILDER LAYOUT */}
          <div style={styles.threeColumnGrid}>
            {/* =========================================================
                LEFT COLUMN: COURSE STRUCTURE TREE
            ========================================================= */}
            <div style={styles.leftTreeColumn}>
              <div style={styles.columnHeader}>
                <span style={styles.columnTitle}>COURSE STRUCTURE</span>
                <button onClick={addModule} style={styles.addModuleSmallBtn}>
                  <Plus size={14} />
                  <span>Add Module</span>
                </button>
              </div>

              <div style={styles.treeScrollArea}>
                {/* Course Root Node */}
                <div
                  onClick={() => setSelectedNode({ type: 'course' })}
                  style={{
                    ...styles.treeCourseRoot,
                    ...(selectedNode.type === 'course' ? styles.treeNodeActive : {})
                  }}
                >
                  <BookOpen size={16} color="var(--primary)" />
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <div style={styles.treeRootTitle}>
                      {courseDraft.course_name || 'Course Basic Info'}
                    </div>
                    <div style={styles.treeRootSub}>
                      Basic Info & {courseDraft.learning_objectives?.length || 0} Objectives
                    </div>
                  </div>
                </div>

                {/* Modules & Topics Tree */}
                {(courseDraft.modules || []).map((mod, mIdx) => {
                  const isModSelected = selectedNode.type === 'module' && selectedNode.modIndex === mIdx;
                  const isExpanded = expandedModules[mIdx] !== false;

                  return (
                    <div key={mIdx} style={styles.treeModuleBlock}>
                      {/* Module Row */}
                      <div
                        onClick={() => setSelectedNode({ type: 'module', modIndex: mIdx })}
                        style={{
                          ...styles.treeModuleRow,
                          ...(isModSelected ? styles.treeNodeActive : {})
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedModules((prev) => ({ ...prev, [mIdx]: !isExpanded }));
                          }}
                          style={styles.treeCollapseBtn}
                        >
                          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>

                        <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                          <div style={styles.treeModName}>{mod.module_name || `Module ${mIdx + 1}`}</div>
                          <div style={styles.treeModMeta}>
                            {(mod.topics || []).length} Topic(s) • {mod.duration || '1 Week'}
                          </div>
                        </div>

                        <div style={styles.treeRowQuickBtns} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => moveModule(mIdx, -1)}
                            disabled={mIdx === 0}
                            style={styles.treeMiniBtn}
                            title="Move Module Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveModule(mIdx, 1)}
                            disabled={mIdx === courseDraft.modules.length - 1}
                            style={styles.treeMiniBtn}
                            title="Move Module Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Nested Topics */}
                      {isExpanded && (
                        <div style={styles.treeTopicsContainer}>
                          {(mod.topics || []).map((top, tIdx) => {
                            const isTopSelected =
                              selectedNode.type === 'topic' &&
                              selectedNode.modIndex === mIdx &&
                              selectedNode.topIndex === tIdx;

                            return (
                              <div
                                key={tIdx}
                                onClick={() =>
                                  setSelectedNode({ type: 'topic', modIndex: mIdx, topIndex: tIdx })
                                }
                                style={{
                                  ...styles.treeTopicRow,
                                  ...(isTopSelected ? styles.treeTopicActive : {})
                                }}
                              >
                                <span style={styles.treeBranchSymbol}>├─</span>
                                <span style={styles.treeTopicName}>
                                  {top.topic_name || `Topic ${tIdx + 1}`}
                                </span>

                                <div style={styles.treeRowQuickBtns} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => moveTopicWithinModule(mIdx, tIdx, -1)}
                                    disabled={tIdx === 0}
                                    style={styles.treeMiniBtn}
                                    title="Move Topic Up"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveTopicWithinModule(mIdx, tIdx, 1)}
                                    disabled={tIdx === (mod.topics?.length || 1) - 1}
                                    style={styles.treeMiniBtn}
                                    title="Move Topic Down"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => addTopicToModule(mIdx)}
                            style={styles.treeAddTopicBtn}
                          >
                            <Plus size={13} />
                            <span>Add Topic</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =========================================================
                CENTER COLUMN: SELECTED NODE EDITOR
            ========================================================= */}
            <div style={styles.centerEditorColumn}>
              {/* -------------------------------------------------------
                  EDITOR MODE A: COURSE BASIC INFORMATION & OBJECTIVES
              ------------------------------------------------------- */}
              {selectedNode.type === 'course' && (
                <div style={styles.editorContent}>
                  <div style={styles.editorHeader}>
                    <div>
                      <span style={styles.editorTypeTag}>COURSE ROOT</span>
                      <h3 style={styles.editorTitle}>Basic Information & Learning Objectives</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => requestSectionRegeneration('description')}
                        disabled={regeneratingSection}
                        style={styles.regenSmallBtn}
                      >
                        <RefreshCw size={13} />
                        <span>Regenerate Description</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => requestSectionRegeneration('objectives')}
                        disabled={regeneratingSection}
                        style={styles.regenSmallBtn}
                      >
                        <RefreshCw size={13} />
                        <span>Regenerate Objectives</span>
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGrid}>
                    <div style={styles.formRow2}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Course Name *</label>
                        <input
                          type="text"
                          value={courseDraft.course_name}
                          onChange={(e) => updateCourseField('course_name', e.target.value)}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Course Code</label>
                        <input
                          type="text"
                          value={courseDraft.course_code}
                          onChange={(e) => updateCourseField('course_code', e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.formRow3}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Category</label>
                        <input
                          type="text"
                          value={courseDraft.category}
                          onChange={(e) => updateCourseField('category', e.target.value)}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Difficulty Level *</label>
                        <select
                          value={courseDraft.difficulty}
                          onChange={(e) => updateCourseField('difficulty', e.target.value)}
                          style={styles.input}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Estimated Duration</label>
                        <input
                          type="text"
                          value={courseDraft.duration}
                          onChange={(e) => updateCourseField('duration', e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Short Description</label>
                      <input
                        type="text"
                        value={courseDraft.short_description}
                        onChange={(e) => updateCourseField('short_description', e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Full Description *</label>
                      <textarea
                        rows={4}
                        value={courseDraft.description}
                        onChange={(e) => updateCourseField('description', e.target.value)}
                        style={styles.textarea}
                      />
                    </div>

                    <div style={styles.formRow2}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Course Prerequisites</label>
                        <input
                          type="text"
                          value={courseDraft.prerequisites}
                          onChange={(e) => updateCourseField('prerequisites', e.target.value)}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Target Audience</label>
                        <input
                          type="text"
                          value={courseDraft.target_audience}
                          onChange={(e) => updateCourseField('target_audience', e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    {/* Course Learning Objectives Editor */}
                    <div style={styles.objectivesBox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={styles.label}>
                          Course Learning Objectives ({courseDraft.learning_objectives?.length || 0})
                        </label>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {(courseDraft.learning_objectives || []).map((obj, idx) => (
                          <div key={idx} style={styles.objectiveRow}>
                            <span style={styles.objectiveIndex}>✓</span>
                            <input
                              type="text"
                              value={obj}
                              onChange={(e) => updateCourseObjective(idx, e.target.value)}
                              style={styles.objectiveInput}
                            />
                            <button
                              type="button"
                              onClick={() => removeCourseObjective(idx)}
                              style={styles.removeObjBtn}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Add a learning objective..."
                          value={newCourseObjText}
                          onChange={(e) => setNewCourseObjText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCourseObjective();
                            }
                          }}
                          style={{ ...styles.input, flexGrow: 1 }}
                        />
                        <button type="button" onClick={addCourseObjective} style={styles.secondaryBtn}>
                          <Plus size={15} />
                          <span>Add Objective</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------
                  EDITOR MODE B: MODULE EDITOR
              ------------------------------------------------------- */}
              {selectedNode.type === 'module' &&
                courseDraft.modules?.[selectedNode.modIndex] &&
                (() => {
                  const mIdx = selectedNode.modIndex;
                  const mod = courseDraft.modules[mIdx];

                  return (
                    <div style={styles.editorContent}>
                      <div style={styles.editorHeader}>
                        <div>
                          <span style={styles.editorTypeTag}>MODULE {mIdx + 1} EDITOR</span>
                          <h3 style={styles.editorTitle}>{mod.module_name}</h3>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => requestSectionRegeneration('module', mIdx)}
                            disabled={regeneratingSection}
                            style={styles.regenSmallBtn}
                          >
                            <RefreshCw size={13} />
                            <span>Regenerate Module</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteModule(mIdx)}
                            style={styles.deleteSmallBtn}
                          >
                            <Trash2 size={14} />
                            <span>Delete Module</span>
                          </button>
                        </div>
                      </div>

                      <div style={styles.formGrid}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Module Name *</label>
                          <input
                            type="text"
                            value={mod.module_name}
                            onChange={(e) => updateModuleField(mIdx, 'module_name', e.target.value)}
                            style={styles.input}
                          />
                        </div>

                        <div style={styles.formRow2}>
                          <div style={styles.fieldGroup}>
                            <label style={styles.label}>Difficulty</label>
                            <select
                              value={mod.difficulty || 'Beginner'}
                              onChange={(e) => updateModuleField(mIdx, 'difficulty', e.target.value)}
                              style={styles.input}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>

                          <div style={styles.fieldGroup}>
                            <label style={styles.label}>Estimated Duration</label>
                            <input
                              type="text"
                              value={mod.duration || ''}
                              onChange={(e) => updateModuleField(mIdx, 'duration', e.target.value)}
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Module Description</label>
                          <textarea
                            rows={3}
                            value={mod.description || ''}
                            onChange={(e) => updateModuleField(mIdx, 'description', e.target.value)}
                            style={styles.textarea}
                          />
                        </div>

                        {/* Module Learning Objectives */}
                        <div style={styles.objectivesBox}>
                          <label style={{ ...styles.label, display: 'block', marginBottom: '10px' }}>
                            Module Learning Objectives ({mod.learning_objectives?.length || 0})
                          </label>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                            {(mod.learning_objectives || []).map((obj, oIdx) => (
                              <div key={oIdx} style={styles.objectiveRow}>
                                <span style={styles.objectiveIndex}>✓</span>
                                <input
                                  type="text"
                                  value={obj}
                                  onChange={(e) => updateModuleObjective(mIdx, oIdx, e.target.value)}
                                  style={styles.objectiveInput}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeModuleObjective(mIdx, oIdx)}
                                  style={styles.removeObjBtn}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Add a module objective..."
                              value={newModuleObjText}
                              onChange={(e) => setNewModuleObjText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addModuleObjective(mIdx);
                                }
                              }}
                              style={{ ...styles.input, flexGrow: 1 }}
                            />
                            <button type="button" onClick={() => addModuleObjective(mIdx)} style={styles.secondaryBtn}>
                              <Plus size={15} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>

                        {/* Topics Inside This Module */}
                        <div style={styles.moduleTopicsOverview}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={styles.label}>
                              Topics in {mod.module_name} ({(mod.topics || []).length})
                            </label>
                            <button
                              type="button"
                              onClick={() => addTopicToModule(mIdx)}
                              style={styles.primaryBtn}
                            >
                              <Plus size={14} />
                              <span>Add Topic</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(mod.topics || []).map((t, tIdx) => (
                              <div key={tIdx} style={styles.subTopicCard}>
                                <div>
                                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                    {t.topic_name}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {t.duration || '45 mins'} • {t.difficulty || 'Beginner'}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedNode({ type: 'topic', modIndex: mIdx, topIndex: tIdx })}
                                    style={styles.secondaryBtn}
                                  >
                                    <Edit3 size={13} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestSectionRegeneration('topic', mIdx, tIdx)}
                                    style={styles.regenSmallBtn}
                                  >
                                    <RefreshCw size={13} />
                                    <span>Regenerate</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* -------------------------------------------------------
                  EDITOR MODE C: TOPIC EDITOR
              ------------------------------------------------------- */}
              {selectedNode.type === 'topic' &&
                courseDraft.modules?.[selectedNode.modIndex]?.topics?.[selectedNode.topIndex] &&
                (() => {
                  const mIdx = selectedNode.modIndex;
                  const tIdx = selectedNode.topIndex;
                  const mod = courseDraft.modules[mIdx];
                  const top = mod.topics[tIdx];

                  return (
                    <div style={styles.editorContent}>
                      <div style={styles.editorHeader}>
                        <div>
                          <span style={styles.editorTypeTag}>
                            {mod.module_name} ➜ TOPIC {tIdx + 1}
                          </span>
                          <h3 style={styles.editorTitle}>{top.topic_name}</h3>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => requestSectionRegeneration('topic', mIdx, tIdx)}
                            disabled={regeneratingSection}
                            style={styles.regenSmallBtn}
                          >
                            <RefreshCw size={13} />
                            <span>Regenerate Topic</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTopic(mIdx, tIdx)}
                            style={styles.deleteSmallBtn}
                          >
                            <Trash2 size={14} />
                            <span>Delete Topic</span>
                          </button>
                        </div>
                      </div>

                      <div style={styles.formGrid}>
                        <div style={styles.formRow2}>
                          <div style={styles.fieldGroup}>
                            <label style={styles.label}>Topic Name *</label>
                            <input
                              type="text"
                              value={top.topic_name}
                              onChange={(e) => updateTopicField(mIdx, tIdx, 'topic_name', e.target.value)}
                              style={styles.input}
                            />
                          </div>

                          <div style={styles.fieldGroup}>
                            <label style={styles.label}>Move Topic to Another Module</label>
                            <select
                              value={mIdx}
                              onChange={(e) => moveTopicToAnotherModule(mIdx, tIdx, e.target.value)}
                              style={styles.input}
                            >
                              {(courseDraft.modules || []).map((mOption, idxOption) => (
                                <option key={idxOption} value={idxOption}>
                                  {mOption.module_name || `Module ${idxOption + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={styles.formRow2}>
                          <div style={styles.fieldGroup}>
                            <label style={styles.label}>Difficulty</label>
                            <select
                              value={top.difficulty || 'Beginner'}
                              onChange={(e) => updateTopicField(mIdx, tIdx, 'difficulty', e.target.value)}
                              style={styles.input}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>

                          <div style={styles.fieldGroup}>
                            <label style={styles.label}>Estimated Duration</label>
                            <input
                              type="text"
                              value={top.duration || ''}
                              onChange={(e) => updateTopicField(mIdx, tIdx, 'duration', e.target.value)}
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Topic Description</label>
                          <textarea
                            rows={3}
                            value={top.description || ''}
                            onChange={(e) => updateTopicField(mIdx, tIdx, 'description', e.target.value)}
                            style={styles.textarea}
                          />
                        </div>

                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Key Concepts / Important Concepts</label>
                          <textarea
                            rows={2}
                            value={top.important_concepts || ''}
                            onChange={(e) => updateTopicField(mIdx, tIdx, 'important_concepts', e.target.value)}
                            style={styles.textarea}
                          />
                        </div>

                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Examples / Important Points</label>
                          <textarea
                            rows={4}
                            value={top.examples || ''}
                            onChange={(e) => updateTopicField(mIdx, tIdx, 'examples', e.target.value)}
                            style={{ ...styles.textarea, fontFamily: 'monospace' }}
                          />
                        </div>

                        {/* Topic Learning Objectives */}
                        <div style={styles.objectivesBox}>
                          <label style={{ ...styles.label, display: 'block', marginBottom: '10px' }}>
                            Topic Learning Objectives ({top.learning_objectives?.length || 0})
                          </label>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                            {(top.learning_objectives || []).map((obj, oIdx) => (
                              <div key={oIdx} style={styles.objectiveRow}>
                                <span style={styles.objectiveIndex}>✓</span>
                                <input
                                  type="text"
                                  value={obj}
                                  onChange={(e) => updateTopicObjective(mIdx, tIdx, oIdx, e.target.value)}
                                  style={styles.objectiveInput}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeTopicObjective(mIdx, tIdx, oIdx)}
                                  style={styles.removeObjBtn}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Add a topic learning objective..."
                              value={newTopicObjText}
                              onChange={(e) => setNewTopicObjText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTopicObjective(mIdx, tIdx);
                                }
                              }}
                              style={{ ...styles.input, flexGrow: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => addTopicObjective(mIdx, tIdx)}
                              style={styles.secondaryBtn}
                            >
                              <Plus size={15} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* =========================================================
                RIGHT COLUMN: COURSE INFO, CHECKLIST & ACTIONS
            ========================================================= */}
            <div style={styles.rightInfoColumn}>
              <div style={styles.columnHeader}>
                <span style={styles.columnTitle}>COURSE INFO & ACTIONS</span>
              </div>

              <div style={styles.rightColumnBody}>
                {/* Summary Metadata Box */}
                <div style={styles.infoBox}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Status</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusBadgeStyle(courseDraft.status).bg,
                        borderColor: getStatusBadgeStyle(courseDraft.status).border,
                        color: getStatusBadgeStyle(courseDraft.status).color
                      }}
                    >
                      {getStatusBadgeStyle(courseDraft.status).label}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Creation Method</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                      {courseDraft.creation_method === 'smart' ? 'Smart Course Builder' : 'Manual Creation'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Difficulty</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                      {courseDraft.difficulty || 'Beginner'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Duration</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                      {courseDraft.duration || '6 Weeks'}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Structure</span>
                    <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.84rem' }}>
                      {publishCheck.totalModules} Modules • {publishCheck.totalTopics} Topics
                    </span>
                  </div>
                </div>

                {/* Publish Validation Checklist */}
                <div style={styles.checklistBox}>
                  <h4 style={styles.checklistTitle}>Publish Readiness Checklist</h4>
                  <div style={styles.checklistItems}>
                    <div style={styles.checkItem}>
                      <CheckCircle2
                        size={15}
                        color={publishCheck.hasName ? '#10b981' : 'var(--text-muted)'}
                      />
                      <span style={{ color: publishCheck.hasName ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        Course name exists
                      </span>
                    </div>

                    <div style={styles.checkItem}>
                      <CheckCircle2
                        size={15}
                        color={publishCheck.hasDesc ? '#10b981' : 'var(--text-muted)'}
                      />
                      <span style={{ color: publishCheck.hasDesc ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        Course description exists
                      </span>
                    </div>

                    <div style={styles.checkItem}>
                      <CheckCircle2
                        size={15}
                        color={
                          publishCheck.hasAtLeastOneModule && publishCheck.allModulesHaveValidNames
                            ? '#10b981'
                            : 'var(--text-muted)'
                        }
                      />
                      <span
                        style={{
                          color:
                            publishCheck.hasAtLeastOneModule && publishCheck.allModulesHaveValidNames
                              ? 'var(--text-primary)'
                              : 'var(--text-muted)'
                        }}
                      >
                        At least 1 valid module ({publishCheck.totalModules})
                      </span>
                    </div>

                    <div style={styles.checkItem}>
                      <CheckCircle2
                        size={15}
                        color={
                          publishCheck.hasAtLeastOneTopic && publishCheck.allTopicsHaveValidNames
                            ? '#10b981'
                            : 'var(--text-muted)'
                        }
                      />
                      <span
                        style={{
                          color:
                            publishCheck.hasAtLeastOneTopic && publishCheck.allTopicsHaveValidNames
                              ? 'var(--text-primary)'
                              : 'var(--text-muted)'
                        }}
                      >
                        At least 1 valid topic ({publishCheck.totalTopics})
                      </span>
                    </div>

                    <div style={styles.checkItem}>
                      <CheckCircle2
                        size={15}
                        color={publishCheck.isSavedInDb ? '#10b981' : '#f59e0b'}
                      />
                      <span style={{ color: publishCheck.isSavedInDb ? 'var(--text-primary)' : '#f59e0b' }}>
                        {publishCheck.isSavedInDb ? 'Draft saved to database' : 'Save Draft required before Publish'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Actions Stack */}
                <div style={styles.actionStack}>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    style={styles.fullWidthPrimaryBtn}
                  >
                    <Save size={16} />
                    <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                  </button>

                  {publishCheck.isSavedInDb ? (
                    <button
                      type="button"
                      onClick={handleOpenPublishConfirmation}
                      disabled={!publishCheck.canPublish || publishingCourse}
                      style={{
                        ...styles.fullWidthPublishBtn,
                        opacity: publishCheck.canPublish ? 1 : 0.55,
                        cursor: publishCheck.canPublish ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Send size={16} />
                      <span>
                        {(courseDraft.status || '').toLowerCase() === 'published'
                          ? 'Update Published Course'
                          : 'Publish Course'}
                      </span>
                    </button>
                  ) : (
                    <div style={styles.publishLockedNote}>
                      Save and review this draft first to unlock the <strong>Publish Course</strong> action.
                    </div>
                  )}

                  {publishCheck.isSavedInDb && (
                    <button
                      type="button"
                      onClick={() => handleDuplicateCourse(courseDraft.id || courseDraft.course_id)}
                      style={styles.fullWidthSecondaryBtn}
                    >
                      <Copy size={15} />
                      <span>Duplicate Course</span>
                    </button>
                  )}

                  {(courseDraft.status || '').toLowerCase() === 'published' && (
                    <button
                      type="button"
                      onClick={() => handleArchiveCourse(courseDraft.id || courseDraft.course_id)}
                      style={styles.fullWidthSecondaryBtn}
                    >
                      <Archive size={15} />
                      <span>Archive Course</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===============================================================
          MODAL 1: EXPLICIT PUBLISH CONFIRMATION
      =============================================================== */}
      {showPublishModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Are you sure you want to publish this course?</h3>
              <button onClick={() => setShowPublishModal(false)} style={styles.bannerCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <p style={styles.modalText}>
              Publishing <strong>{courseDraft.course_name}</strong> will change its status from{' '}
              <strong>Draft</strong> to <strong>Published</strong> and make its{' '}
              <strong>{publishCheck.totalModules} module(s)</strong> and{' '}
              <strong>{publishCheck.totalTopics} topic(s)</strong> available to enrolled students.
            </p>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                style={styles.secondaryBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={publishingCourse}
                style={styles.fullWidthPublishBtn}
              >
                <Check size={16} />
                <span>{publishingCourse ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===============================================================
          MODAL 2: SECTION-LEVEL REGENERATION CONFIRMATION
      =============================================================== */}
      {regenConfirmModal.open && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '580px' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                Replace this section with the newly generated version?
              </h3>
              <button
                onClick={() =>
                  setRegenConfirmModal({
                    open: false,
                    sectionType: '',
                    label: '',
                    previewData: null,
                    modIndex: null,
                    topIndex: null
                  })
                }
                style={styles.bannerCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <p style={styles.modalText}>
              Target section: <strong>{regenConfirmModal.label}</strong>. All other modules and topics in your course will remain untouched.
            </p>

            {/* Preview Box */}
            <div style={styles.regenPreviewBox}>
              {regenConfirmModal.sectionType === 'description' && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary)' }}>
                    New Description Preview:
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {regenConfirmModal.previewData?.description}
                  </p>
                </div>
              )}

              {regenConfirmModal.sectionType === 'objectives' && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--primary)' }}>
                    New Learning Objectives:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {(regenConfirmModal.previewData?.learning_objectives || []).map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {regenConfirmModal.sectionType === 'module' && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary)' }}>
                    {regenConfirmModal.previewData?.module_name}
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {regenConfirmModal.previewData?.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Generated Topics: {(regenConfirmModal.previewData?.topics || []).map((t) => t.topic_name).join(', ')}
                  </div>
                </div>
              )}

              {regenConfirmModal.sectionType === 'topic' && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary)' }}>
                    {regenConfirmModal.previewData?.topic_name}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {regenConfirmModal.previewData?.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Concepts: {regenConfirmModal.previewData?.important_concepts}
                  </div>
                </div>
              )}

              {regenConfirmModal.sectionType === 'course' && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary)' }}>
                    Regenerated Course Structure ({regenConfirmModal.previewData?.modules?.length || 0} Modules)
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {regenConfirmModal.previewData?.short_description}
                  </p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() =>
                  setRegenConfirmModal({
                    open: false,
                    sectionType: '',
                    label: '',
                    previewData: null,
                    modIndex: null,
                    topIndex: null
                  })
                }
                style={styles.secondaryBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmApplyRegeneratedSection}
                style={styles.primaryBtn}
              >
                <RefreshCw size={15} />
                <span>Replace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  topHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-color)'
  },
  pageTitle: {
    fontSize: '1.65rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: "'Outfit', sans-serif"
  },
  pageSubtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    margin: '4px 0 0'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger)',
    fontSize: '0.88rem',
    fontWeight: '500'
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    fontSize: '0.88rem',
    fontWeight: '500'
  },
  bannerCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  entryChoicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '18px'
  },
  entryChoiceCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '22px',
    display: 'flex',
    gap: '18px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  entryChoiceCardSmart: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid rgba(56, 189, 248, 0.35)',
    backgroundImage: 'radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.08) 0px, transparent 60%)',
    borderRadius: '14px',
    padding: '22px',
    display: 'flex',
    gap: '18px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  entryIconBoxManual: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    backgroundColor: 'rgba(var(--primary-rgb), 0.12)',
    border: '1px solid rgba(var(--primary-rgb), 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  entryIconBoxSmart: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  entryCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1
  },
  entryBadgeRow: {
    display: 'flex',
    gap: '8px'
  },
  methodBadgeManual: {
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '8px',
    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
    color: 'var(--primary)'
  },
  methodBadgeSmart: {
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '8px',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8'
  },
  entryCardTitle: {
    fontSize: '1.18rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  entryCardDesc: {
    fontSize: '0.86rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: 0
  },
  entryActionBtnManual: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  entryActionBtnSmart: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    border: 'none',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  catalogSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  catalogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  filterTabs: {
    display: 'flex',
    gap: '6px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },
  filterTabBtn: {
    padding: '6px 14px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  filterTabBtnActive: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: '600'
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px'
  },
  courseCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  courseCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  codePill: {
    fontSize: '0.74rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)'
  },
  statusBadge: {
    fontSize: '0.73rem',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '12px',
    border: '1px solid'
  },
  creationTagManual: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    color: 'var(--text-secondary)'
  },
  creationTagSmart: {
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#38bdf8'
  },
  courseCardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  courseCardDesc: {
    fontSize: '0.84rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.45,
    margin: 0,
    flexGrow: 1
  },
  courseMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)'
  },
  metaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  courseCardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  openBuilderBtn: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  reviewPublishBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    color: '#10b981',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  archiveSmallBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  iconBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '7px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  formViewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  methodSwitcherBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  backLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  switcherPills: {
    display: 'flex',
    gap: '8px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },
  switcherBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  switcherBtnActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  switcherBtnActiveSmart: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  stepCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '24px'
  },
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)'
  },
  stepBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--primary)',
    letterSpacing: '0.05em'
  },
  stepBadgeSmart: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: '0.05em'
  },
  stepTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '4px 0'
  },
  stepSub: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    margin: 0
  },
  presetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: '#38bdf8',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  formRow3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    outline: 'none'
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  objectivesBox: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '16px'
  },
  objectiveRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  objectiveIndex: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: '0.9rem'
  },
  objectiveInput: {
    flexGrow: 1,
    padding: '8px 10px',
    borderRadius: '7px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem'
  },
  removeObjBtn: {
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--danger)',
    cursor: 'pointer'
  },
  stepFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '14px',
    borderTop: '1px solid var(--border-color)'
  },
  generatingLoaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '56px 24px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '12px',
    border: '1px solid rgba(56, 189, 248, 0.3)'
  },
  smartGenerateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    borderRadius: '9px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.92rem',
    border: 'none',
    cursor: 'pointer'
  },
  builderTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  },
  draftGeneratedBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px 20px',
    borderRadius: '12px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.35)'
  },
  draftBannerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  threeColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr 290px',
    gap: '16px',
    alignItems: 'start'
  },
  leftTreeColumn: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  centerEditorColumn: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '22px',
    minHeight: '560px'
  },
  rightInfoColumn: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  columnHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-primary)'
  },
  columnTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)'
  },
  addModuleSmallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  treeScrollArea: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '680px',
    overflowY: 'auto'
  },
  treeCourseRoot: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '9px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    cursor: 'pointer'
  },
  treeNodeActive: {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
    boxShadow: '0 0 0 1px var(--primary)'
  },
  treeRootTitle: {
    fontSize: '0.86rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  treeRootSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  treeModuleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  treeModuleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    cursor: 'pointer'
  },
  treeCollapseBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  treeModName: {
    fontSize: '0.84rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  treeModMeta: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  treeRowQuickBtns: {
    display: 'flex',
    gap: '2px'
  },
  treeMiniBtn: {
    padding: '2px 4px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  treeTopicsContainer: {
    paddingLeft: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '2px'
  },
  treeTopicRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    border: '1px solid transparent'
  },
  treeTopicActive: {
    backgroundColor: 'rgba(var(--primary-rgb), 0.12)',
    color: 'var(--primary)',
    borderColor: 'rgba(var(--primary-rgb), 0.35)',
    fontWeight: '600'
  },
  treeBranchSymbol: {
    color: 'var(--text-muted)',
    fontFamily: 'monospace'
  },
  treeTopicName: {
    flexGrow: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  treeAddTopicBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 8px',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    border: '1px dashed var(--border-color)',
    color: 'var(--primary)',
    fontSize: '0.76rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '2px'
  },
  editorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--border-color)'
  },
  editorTypeTag: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--primary)',
    letterSpacing: '0.05em'
  },
  editorTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '4px 0 0'
  },
  regenSmallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '7px',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: '#38bdf8',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  regenOutlineBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    color: '#38bdf8',
    fontSize: '0.84rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  deleteSmallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '7px',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger)',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  moduleTopicsOverview: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '16px'
  },
  subTopicCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)'
  },
  rightColumnBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  infoBox: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.82rem'
  },
  infoLabel: {
    color: 'var(--text-muted)'
  },
  checklistBox: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '14px'
  },
  checklistTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 10px'
  },
  checklistItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem'
  },
  actionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  fullWidthPrimaryBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px 16px',
    borderRadius: '9px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer'
  },
  fullWidthPublishBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px 16px',
    borderRadius: '9px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer'
  },
  fullWidthSecondaryBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '9px 14px',
    borderRadius: '9px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontWeight: '500',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  publishLockedNote: {
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
    fontSize: '0.78rem',
    lineHeight: 1.4,
    textAlign: 'center'
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontWeight: '500',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  loadingCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '48px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)'
  },
  emptyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    textAlign: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modalCard: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  modalText: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: 0
  },
  regenPreviewBox: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '14px',
    maxHeight: '220px',
    overflowY: 'auto'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px'
  }
};
