import React, { useState, useEffect } from 'react';
import assignmentService from '../../services/assignmentService';
import courseService from '../../services/courseService';
import AssignmentDashboard from '../../components/teacher/assignments/AssignmentDashboard';
import AssignmentWizard from '../../components/teacher/assignments/AssignmentWizard';
import AssignmentSubmissions from '../../components/teacher/assignments/AssignmentSubmissions';

export default function TeacherAssignments({ teacher }) {
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'wizard', 'submissions'
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultForm = {
    title: '', assignment_code: '', category: 'Lab', difficulty: 'Intermediate',
    course_id: '', topic_id: '',
    description: '', instructions: '',
    passing_marks: 50, max_marks: 100,
    start_at: '', due_at: '', late_deadline: '',
    submission_type: 'File Upload', allowed_file_types: '.pdf,.doc,.docx,.zip,.py,.js',
    max_file_size: 10485760, max_files: 1, max_attempts: 1,
    allow_resubmission: false, accept_late_submissions: false, late_policy: '',
    grading_method: 'Manual Grading', feedback_required: false, grade_release_mode: 'Release after each evaluation',
    status: 'Draft'
  };

  const [assnForm, setAssnForm] = useState(defaultForm);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (assnForm.course_id) {
      loadTopics(assnForm.course_id);
    }
  }, [assnForm.course_id]);

  const loadInitialData = async () => {
    try {
      const cList = await courseService.getAllCourses();
      setCourses(cList);
      if (cList.length > 0) {
        setSelectedCourseId(cList[0].course_id);
        loadAssignments(cList[0].course_id);
      } else {
        loadAssignments('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAssignments = async (courseId) => {
    try {
      const data = await assignmentService.getAssignments(courseId);
      setAssignments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTopics = async (courseId) => {
    try {
      const tList = await courseService.getCourseTopics(courseId);
      setTopics(tList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseChange = (cid) => {
    setSelectedCourseId(cid);
    loadAssignments(cid);
  };

  const handleCreateClick = () => {
    setAssnForm({ ...defaultForm, course_id: selectedCourseId });
    setViewMode('wizard');
  };

  const handleEditClick = (assn) => {
    setAssnForm({
      ...defaultForm,
      ...assn,
      course_id: assn.course_id,
      topic_id: assn.topic_id || '',
      start_at: assn.start_at ? assn.start_at.slice(0, 16) : '',
      due_at: assn.due_at ? assn.due_at.slice(0, 16) : '',
      late_deadline: assn.late_deadline ? assn.late_deadline.slice(0, 16) : ''
    });
    setViewMode('wizard');
  };

  const handleDuplicateClick = (assn) => {
    setAssnForm({
      ...defaultForm,
      ...assn,
      assignment_id: null,
      id: null,
      title: `${assn.title} (Copy)`,
      status: 'Draft',
      start_at: assn.start_at ? assn.start_at.slice(0, 16) : '',
      due_at: assn.due_at ? assn.due_at.slice(0, 16) : '',
      late_deadline: assn.late_deadline ? assn.late_deadline.slice(0, 16) : ''
    });
    setViewMode('wizard');
  };

  const handleSave = async (status) => {
    setIsSaving(true);
    try {
      const payload = { ...assnForm, status };
      if (assnForm.assignment_id) {
        await assignmentService.updateAssignment(payload);
      } else {
        await assignmentService.createAssignment(payload);
      }
      setViewMode('dashboard');
      loadAssignments(selectedCourseId);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment permanently?")) return;
    try {
      await assignmentService.deleteAssignment(id);
      loadAssignments(selectedCourseId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCloseAssignment = async (assn) => {
    if (!window.confirm("Close this assignment? Students will no longer be able to submit.")) return;
    try {
      await assignmentService.updateAssignment({ ...assn, status: 'Closed' });
      loadAssignments(selectedCourseId);
    } catch (err) {
      alert(err.message);
    }
  };

  const openSubmissions = (assn) => {
    setActiveAssignment(assn);
    setViewMode('submissions');
  };

  return (
    <>
      {viewMode === 'dashboard' && (
        <AssignmentDashboard 
          assignments={assignments}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={handleCourseChange}
          onCreateClick={handleCreateClick}
          onViewSubmissions={openSubmissions}
          onEditAssignment={handleEditClick}
          onDuplicateAssignment={handleDuplicateClick}
          onDeleteAssignment={handleDelete}
          onCloseAssignment={handleCloseAssignment}
        />
      )}
      
      {viewMode === 'wizard' && (
        <AssignmentWizard
          form={assnForm}
          setForm={setAssnForm}
          courses={courses}
          topics={topics}
          isSaving={isSaving}
          onSaveDraft={() => handleSave('Draft')}
          onPublish={() => handleSave('Published')}
          onCancel={() => setViewMode('dashboard')}
        />
      )}

      {viewMode === 'submissions' && activeAssignment && (
        <AssignmentSubmissions 
          assignment={activeAssignment}
          onBack={() => setViewMode('dashboard')}
        />
      )}
    </>
  );
}
