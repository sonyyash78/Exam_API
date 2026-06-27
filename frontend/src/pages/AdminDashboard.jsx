import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examService, subjectService, chapterService, questionService, browseService } from '../api/api';
import { TableSkeleton } from '../components/SkeletonLoader';
import { FaTrophy, FaBook, FaFolderOpen, FaTasks, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaDatabase, FaCog, FaUpload, FaFileCsv } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Navigation guard
  useEffect(() => {
    if (!user || !isAdmin()) {
      toast.error('Admin access required.');
      navigate('/login');
    }
  }, [user]);

  // Tab State: 'overview', 'exams', 'subjects', 'chapters', 'questions', 'bulk_upload'
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ exam_count: 0, subject_count: 0, chapter_count: 0, question_count: 0 });

  // Data States
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Sub-filtering states for listing questions / chapters
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');

  // Bulk Upload File State
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadingBulk, setUploadingBulk] = useState(false);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'exam', 'subject', 'chapter', 'question'
  const [editItem, setEditItem] = useState(null); // Item currently being edited
  
  // Confirmation Dialog State
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Form Fields State
  const [examForm, setExamForm] = useState({ exam_name: '', category: 'Engineering', image: '', positive_marks: 4.0, negative_marks: -1.0 });
  const [subjectForm, setSubjectForm] = useState({ name: '', exam_id: '' });
  const [chapterForm, setChapterForm] = useState({ name: '', subject_id: '' });
  const [questionForm, setQuestionForm] = useState({
    exam_id: '',
    chapter_id: '',
    question: '',
    question_type: 'mcq',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    solution: '',
    year: new Date().getFullYear(),
    exam_session: '',
    difficulty: 'Medium',
    marks: 4.0,
    negative_marks: -1.0,
    time: 60,
    topic: ''
  });

  // Fetch Dashboard Stats
  const loadStats = async () => {
    try {
      const data = await browseService.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Handle Tab Switch & Fetch corresponding tab list
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'bulk_upload') {
      loadStats();
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'exams') {
          const list = await examService.listExams(1, 100);
          setExams(list);
        } else if (activeTab === 'subjects') {
          const list = await subjectService.listSubjects(1, 100);
          const exList = await examService.listExams(1, 100);
          setExams(exList);
          setSubjects(list);
        } else if (activeTab === 'chapters') {
          const exList = await examService.listExams(1, 100);
          setExams(exList);
          
          if (selectedSubjectId) {
            const list = await chapterService.listChaptersBySubject(selectedSubjectId);
            setChapters(list);
          } else {
            setChapters([]);
          }
        } else if (activeTab === 'questions') {
          const exList = await examService.listExams(1, 100);
          setExams(exList);
          
          if (selectedChapterId) {
            const list = await questionService.listQuestionsByChapter(selectedChapterId, 0, 100);
            setQuestions(list);
          } else {
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedExamId, selectedSubjectId, selectedChapterId]);

  // Cascading helpers
  const handleExamChangeForChapters = async (examId) => {
    setSelectedExamId(examId);
    setSelectedSubjectId('');
    setChapters([]);
    if (examId) {
      try {
        const subs = await examService.listSubjectsByExam(examId);
        setSubjects(subs);
      } catch (err) {
        toast.error('Failed to load subjects.');
      }
    } else {
      setSubjects([]);
    }
  };

  const handleExamChangeForQuestions = async (examId) => {
    setSelectedExamId(examId);
    setSelectedSubjectId('');
    setSelectedChapterId('');
    setQuestions([]);
    if (examId) {
      try {
        const subs = await examService.listSubjectsByExam(examId);
        setSubjects(subs);
      } catch (err) {
        toast.error('Failed to load subjects.');
      }
    } else {
      setSubjects([]);
    }
  };

  const handleSubjectChangeForQuestions = async (subId) => {
    setSelectedSubjectId(subId);
    setSelectedChapterId('');
    setQuestions([]);
    if (subId) {
      try {
        const chaps = await chapterService.listChaptersBySubject(subId);
        setChapters(chaps);
      } catch (err) {
        toast.error('Failed to load chapters.');
      }
    } else {
      setChapters([]);
    }
  };

  // --- CRUD Forms ---

  const handleSaveExam = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await examService.updateExam(editItem.id, examForm);
        toast.success('Exam details updated!');
      } else {
        await examService.createExam(examForm);
        toast.success('New exam configured!');
      }
      setShowModal(false);
      const list = await examService.listExams(1, 100);
      setExams(list);
      loadStats();
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await subjectService.updateSubject(editItem.id, { name: subjectForm.name });
        toast.success('Subject details updated!');
      } else {
        await subjectService.createSubject(subjectForm);
        toast.success('New subject added!');
      }
      setShowModal(false);
      const list = await subjectService.listSubjects(1, 100);
      setSubjects(list);
      loadStats();
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await chapterService.updateChapter(editItem.id, { name: chapterForm.name });
        toast.success('Chapter details updated!');
      } else {
        await chapterService.createChapter(chapterForm);
        toast.success('New chapter configured!');
      }
      setShowModal(false);
      if (selectedSubjectId) {
        const list = await chapterService.listChaptersBySubject(selectedSubjectId);
        setChapters(list);
      }
      loadStats();
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await questionService.updateQuestion(editItem.id, questionForm);
        toast.success('Question updated successfully!');
      } else {
        await questionService.createQuestion(questionForm);
        toast.success('Question added successfully!');
      }
      setShowModal(false);
      if (selectedChapterId) {
        const list = await questionService.listQuestionsByChapter(selectedChapterId, 0, 100);
        setQuestions(list);
      }
      loadStats();
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  // Generic edits
  const triggerEdit = (type, item) => {
    setEditItem(item);
    setModalType(type);
    
    if (type === 'exam') {
      setExamForm({
        exam_name: item.exam_name,
        category: item.category,
        image: item.image,
        positive_marks: item.positive_marks ?? 4.0,
        negative_marks: item.negative_marks ?? -1.0
      });
    } else if (type === 'subject') {
      setSubjectForm({ name: item.name, exam_id: item.exam_id });
    } else if (type === 'chapter') {
      setChapterForm({ name: item.name, subject_id: item.subject_id });
    } else if (type === 'question') {
      setQuestionForm({
        exam_id: item.exam_id,
        chapter_id: item.chapter_id || '',
        question: item.question,
        question_type: item.question_type || 'mcq',
        option_a: item.option_a || '',
        option_b: item.option_b || '',
        option_c: item.option_c || '',
        option_d: item.option_d || '',
        correct_answer: item.correct_answer,
        solution: item.solution || '',
        year: item.year || new Date().getFullYear(),
        exam_session: item.exam_session || '',
        difficulty: item.difficulty || 'Medium',
        marks: item.marks ?? 4.0,
        negative_marks: item.negative_marks ?? -1.0,
        time: item.time ?? 60,
        topic: item.topic || ''
      });
    }
    setShowModal(true);
  };

  const triggerCreate = (type) => {
    setEditItem(null);
    setModalType(type);
    
    if (type === 'exam') {
      setExamForm({ exam_name: '', category: 'Engineering', image: '', positive_marks: 4.0, negative_marks: -1.0 });
    } else if (type === 'subject') {
      setSubjectForm({ name: '', exam_id: selectedExamId || (exams[0]?.id || '') });
    } else if (type === 'chapter') {
      setChapterForm({ name: '', subject_id: selectedSubjectId || '' });
    } else if (type === 'question') {
      setQuestionForm({
        exam_id: selectedExamId || '',
        chapter_id: selectedChapterId || '',
        question: '',
        question_type: 'mcq',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        solution: '',
        year: new Date().getFullYear(),
        exam_session: '',
        difficulty: 'Medium',
        marks: 4.0,
        negative_marks: -1.0,
        time: 60,
        topic: ''
      });
    }
    setShowModal(true);
  };

  const triggerDelete = (type, id) => {
    const action = async () => {
      try {
        if (type === 'exam') {
          await examService.deleteExam(id);
          const list = await examService.listExams(1, 100);
          setExams(list);
        } else if (type === 'subject') {
          await subjectService.deleteSubject(id);
          const list = await subjectService.listSubjects(1, 100);
          setSubjects(list);
        } else if (type === 'chapter') {
          await chapterService.deleteChapter(id);
          if (selectedSubjectId) {
            const list = await chapterService.listChaptersBySubject(selectedSubjectId);
            setChapters(list);
          }
        } else if (type === 'question') {
          await questionService.deleteQuestion(id);
          if (selectedChapterId) {
            const list = await questionService.listQuestionsByChapter(selectedChapterId, 0, 100);
            setQuestions(list);
          }
        }
        toast.success(`Deleted successfully!`);
        loadStats();
      } catch (err) {
        toast.error('Deletion failed.');
      }
    };

    setConfirmAction(() => action);
    setShowConfirm(true);
  };

  // --- Bulk CSV Upload Handler ---
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setUploadingBulk(true);
    const toastId = toast.loading('Uploading CSV and parsing questions...');
    try {
      const response = await questionService.bulkUpload(bulkFile);
      // Response: { status, inserted_questions }
      toast.success(`Success! Successfully imported ${response.inserted_questions} questions.`, { id: toastId, duration: 5000 });
      setBulkFile(null);
      loadStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'CSV upload failed. Verify column headers.', { id: toastId });
    } finally {
      setUploadingBulk(false);
    }
  };

  if (!user || !isAdmin()) return null;

  return (
    <div className="relative min-h-screen py-10 px-4 md:px-8">
      {/* Background blobs */}
      <div className="bg-blob blob-indigo top-10 left-10"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <FaCog className="text-indigo-400" /> Admin Console
            </h1>
            <p className="text-xs text-slate-450 mt-1">
              Logged in as <span className="text-indigo-300 font-bold">{user.name}</span>
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'exams', name: 'Exams' },
              { id: 'subjects', name: 'Subjects' },
              { id: 'chapters', name: 'Chapters' },
              { id: 'questions', name: 'Questions' },
              { id: 'bulk_upload', name: 'CSV Bulk Upload' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Exams', val: stats.exam_count, col: 'text-indigo-400', icon: <FaTrophy /> },
                { name: 'Subjects', val: stats.subject_count, col: 'text-emerald-400', icon: <FaBook /> },
                { name: 'Chapters', val: stats.chapter_count, col: 'text-cyan-400', icon: <FaFolderOpen /> },
                { name: 'Questions', val: stats.question_count, col: 'text-purple-400', icon: <FaTasks /> },
              ].map(stat => (
                <div key={stat.name} className="glass p-6 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-450 uppercase font-semibold">{stat.name}</span>
                    <span className={`text-lg ${stat.col}`}>{stat.icon}</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{stat.val}</div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl border border-slate-800/80 p-8 space-y-4">
              <h3 className="font-bold text-lg text-white">Database Control</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                Add and configure your mock tests. Each exam features custom markings which can be configured inside the Exam settings. Use the CSV bulk tab to import large sets of questions.
              </p>
            </div>
          </div>
        )}

        {/* --- EXAMS TAB --- */}
        {activeTab === 'exams' && (
          <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Exams Directory</h3>
              <button
                onClick={() => triggerCreate('exam')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white cursor-pointer"
              >
                <FaPlus /> Create Exam
              </button>
            </div>

            {loading ? <TableSkeleton /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase text-slate-450 bg-slate-950/60 border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Exam Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Marking Pattern</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {exams.map(ex => (
                      <tr key={ex.id} className="hover:bg-slate-900/30">
                        <td className="px-6 py-4 font-mono text-xs">{ex.id}</td>
                        <td className="px-6 py-4 font-semibold text-white">{ex.exam_name}</td>
                        <td className="px-6 py-4">{ex.category}</td>
                        <td className="px-6 py-4 text-xs font-mono text-indigo-400 font-bold">
                          +{ex.positive_marks ?? 4} / {ex.negative_marks ?? -1}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => triggerEdit('exam', ex)} className="p-2 rounded bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 cursor-pointer"><FaEdit /></button>
                          <button onClick={() => triggerDelete('exam', ex.id)} className="p-2 rounded bg-slate-800 hover:bg-rose-600/20 text-rose-400 cursor-pointer"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- SUBJECTS TAB --- */}
        {activeTab === 'subjects' && (
          <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Subjects Directory</h3>
              <button
                onClick={() => triggerCreate('subject')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white cursor-pointer"
              >
                <FaPlus /> Create Subject
              </button>
            </div>

            {loading ? <TableSkeleton /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase text-slate-450 bg-slate-950/60 border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Subject Name</th>
                      <th className="px-6 py-4">Exam Name (ID)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {subjects.map(sub => {
                      const exam = exams.find(e => e.id === sub.exam_id);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-900/30">
                          <td className="px-6 py-4 font-mono text-xs">{sub.id}</td>
                          <td className="px-6 py-4 font-semibold text-white">{sub.name}</td>
                          <td className="px-6 py-4">{exam ? exam.exam_name : 'unknown'} ({sub.exam_id})</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => triggerEdit('subject', sub)} className="p-2 rounded bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 cursor-pointer"><FaEdit /></button>
                            <button onClick={() => triggerDelete('subject', sub.id)} className="p-2 rounded bg-slate-800 hover:bg-rose-600/20 text-rose-400 cursor-pointer"><FaTrash /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- CHAPTERS TAB --- */}
        {activeTab === 'chapters' && (
          <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="font-bold text-lg text-white">Topics/Chapters</h3>
              
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChangeForChapters(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-350 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs cursor-pointer"
                >
                  <option value="">Select Exam...</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                </select>

                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  disabled={!selectedExamId}
                  className="bg-slate-950 border border-slate-800 text-slate-350 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs disabled:opacity-40 cursor-pointer"
                >
                  <option value="">Select Subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <button
                  disabled={!selectedSubjectId}
                  onClick={() => triggerCreate('chapter')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  <FaPlus /> Create Chapter
                </button>
              </div>
            </div>

            {!selectedSubjectId ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Please select an exam and subject first to see its chapters.
              </div>
            ) : loading ? <TableSkeleton /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase text-slate-450 bg-slate-950/60 border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Chapter Name</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {chapters.map(chap => (
                      <tr key={chap.id} className="hover:bg-slate-900/30">
                        <td className="px-6 py-4 font-mono text-xs">{chap.id}</td>
                        <td className="px-6 py-4 font-semibold text-white">{chap.name}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => triggerEdit('chapter', chap)} className="p-2 rounded bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 cursor-pointer"><FaEdit /></button>
                          <button onClick={() => triggerDelete('chapter', chap.id)} className="p-2 rounded bg-slate-800 hover:bg-rose-600/20 text-rose-400 cursor-pointer"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- QUESTIONS TAB --- */}
        {activeTab === 'questions' && (
          <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="font-bold text-lg text-white">Questions Bank</h3>

              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChangeForQuestions(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-350 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs cursor-pointer"
                >
                  <option value="">Exam...</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                </select>

                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChangeForQuestions(e.target.value)}
                  disabled={!selectedExamId}
                  className="bg-slate-950 border border-slate-800 text-slate-350 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs disabled:opacity-40 cursor-pointer"
                >
                  <option value="">Subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  disabled={!selectedSubjectId}
                  className="bg-slate-950 border border-slate-800 text-slate-350 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs disabled:opacity-40 cursor-pointer"
                >
                  <option value="">Chapter...</option>
                  {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <button
                  disabled={!selectedExamId}
                  onClick={() => triggerCreate('question')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  <FaPlus /> Create Question
                </button>
              </div>
            </div>

            {!selectedChapterId ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Select Exam, Subject, and Chapter to load questions.
              </div>
            ) : loading ? <TableSkeleton /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase text-slate-450 bg-slate-950/60 border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Question Text</th>
                      <th className="px-6 py-4">Correct</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {questions.map(q => (
                      <tr key={q.id} className="hover:bg-slate-900/30">
                        <td className="px-6 py-4 font-mono text-xs">{q.id}</td>
                        <td className="px-6 py-4 max-w-sm truncate text-white">{q.question}</td>
                        <td className="px-6 py-4 font-mono text-indigo-400 font-bold">{q.correct_answer}</td>
                        <td className="px-6 py-4">{q.difficulty || 'Medium'}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => triggerEdit('question', q)} className="p-2 rounded bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 cursor-pointer"><FaEdit /></button>
                          <button onClick={() => triggerDelete('question', q.id)} className="p-2 rounded bg-slate-800 hover:bg-rose-600/20 text-rose-400 cursor-pointer"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- BULK UPLOAD TAB --- */}
        {activeTab === 'bulk_upload' && (
          <div className="glass rounded-2xl border border-slate-800/80 p-8 space-y-6">
            <h3 className="font-bold text-lg text-white">Import Questions in Bulk (CSV)</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Upload a `.csv` file. The column headers should match: <br />
              <code className="text-indigo-300 font-mono">exam_id, chapter_id, question, option_a, option_b, option_c, option_d, correct_answer, solution, year, exam_session, difficulty, marks, negative_marks, time, topic</code>
            </p>

            <form onSubmit={handleBulkUpload} className="space-y-6 max-w-md">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-slate-800 border-dashed rounded-2xl cursor-pointer hover:bg-slate-950/60 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaFileCsv className="text-4xl text-slate-500 mb-3" />
                    <p className="mb-2 text-xs text-slate-400">
                      {bulkFile ? <span className="text-indigo-400 font-bold">{bulkFile.name}</span> : <span>Click to upload CSV template file</span>}
                    </p>
                    <p className="text-[10px] text-slate-550">CSV files only</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={uploadingBulk || !bulkFile}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <FaUpload />
                {uploadingBulk ? 'Uploading...' : 'Import CSV'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* --- FORM MODAL DIALOG --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg text-white mb-6 uppercase tracking-wide">
              {editItem ? 'Edit' : 'Create'} {modalType.toUpperCase()}
            </h3>

            {/* EXAM FORM */}
            {modalType === 'exam' && (
              <form onSubmit={handleSaveExam} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Exam Name</label>
                  <input
                    type="text"
                    required
                    value={examForm.exam_name}
                    onChange={e => setExamForm({ ...examForm, exam_name: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Category</label>
                  <select
                    value={examForm.category}
                    onChange={e => setExamForm({ ...examForm, category: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-350 animate-fade"
                  >
                    {['Engineering', 'Medical', 'Government', 'Banking', 'Railway', 'State Exams', 'Defence', 'Management', 'Law', 'Teaching'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Image Logo Path</label>
                  <input
                    type="text"
                    placeholder="e.g. jee-main.png"
                    value={examForm.image}
                    onChange={e => setExamForm({ ...examForm, image: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Positive Marks per Question</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={examForm.positive_marks}
                      onChange={e => setExamForm({ ...examForm, positive_marks: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Negative Marks per Question</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={examForm.negative_marks}
                      onChange={e => setExamForm({ ...examForm, negative_marks: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer">Save Changes</button>
                </div>
              </form>
            )}

            {/* SUBJECT FORM */}
            {modalType === 'subject' && (
              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.name}
                    onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Exam Reference</label>
                  <select
                    value={subjectForm.exam_id}
                    disabled={!!editItem}
                    onChange={e => setSubjectForm({ ...subjectForm, exam_id: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-350 disabled:opacity-40"
                  >
                    {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer">Save</button>
                </div>
              </form>
            )}

            {/* CHAPTER FORM */}
            {modalType === 'chapter' && (
              <form onSubmit={handleSaveChapter} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Chapter Name</label>
                  <input
                    type="text"
                    required
                    value={chapterForm.name}
                    onChange={e => setChapterForm({ ...chapterForm, name: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Subject ID</label>
                  <input
                    type="text"
                    disabled
                    value={chapterForm.subject_id}
                    className="w-full p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-sm text-slate-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer">Save</button>
                </div>
              </form>
            )}

            {/* QUESTION FORM */}
            {modalType === 'question' && (
              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Exam ID</label>
                    <input
                      type="number"
                      required
                      disabled={!!editItem}
                      value={questionForm.exam_id}
                      onChange={e => setQuestionForm({ ...questionForm, exam_id: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200 disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Chapter ID</label>
                    <input
                      type="number"
                      value={questionForm.chapter_id}
                      onChange={e => setQuestionForm({ ...questionForm, chapter_id: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Question Prompt</label>
                  <textarea
                    required
                    rows="3"
                    value={questionForm.question}
                    onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <div key={opt} className="space-y-1">
                      <label className="text-xs text-slate-450">Option {opt.toUpperCase()}</label>
                      <input
                        type="text"
                        value={questionForm[`option_${opt}`]}
                        onChange={e => setQuestionForm({ ...questionForm, [`option_${opt}`]: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Correct Option</label>
                    <select
                      value={questionForm.correct_answer}
                      onChange={e => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-350"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Difficulty</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-350"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Time (seconds)</label>
                    <input
                      type="number"
                      value={questionForm.time}
                      onChange={e => setQuestionForm({ ...questionForm, time: parseInt(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Year</label>
                    <input
                      type="number"
                      value={questionForm.year}
                      onChange={e => setQuestionForm({ ...questionForm, year: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Session</label>
                    <input
                      type="text"
                      placeholder="e.g. Session 1"
                      value={questionForm.exam_session}
                      onChange={e => setQuestionForm({ ...questionForm, exam_session: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Custom Marks (+)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={questionForm.marks}
                      onChange={e => setQuestionForm({ ...questionForm, marks: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-450">Custom Neg Marks (-)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={questionForm.negative_marks}
                      onChange={e => setQuestionForm({ ...questionForm, negative_marks: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Topic Tag (Optional)</label>
                  <input
                    type="text"
                    value={questionForm.topic}
                    onChange={e => setQuestionForm({ ...questionForm, topic: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-450">Solution Explanation</label>
                  <textarea
                    rows="3"
                    value={questionForm.solution}
                    onChange={e => setQuestionForm({ ...questionForm, solution: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- CONFIRMATION DIALOG MODAL --- */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass rounded-3xl p-6 max-w-sm w-full border border-slate-800 text-center space-y-6 shadow-2xl">
            <h4 className="text-white font-extrabold text-lg">Are you sure?</h4>
            <p className="text-sm text-slate-400">
              This action cannot be undone and will permanently delete the selected item from the database.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-400 transition-colors cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  setShowConfirm(false);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-semibold text-white shadow-lg transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
