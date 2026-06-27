import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { browseService, subjectService } from '../api/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import { FaBookOpen, FaFolderOpen, FaArrowRight, FaQuestionCircle, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Subjects = () => {
  const navigate = useNavigate();
  const [examMap, setExamMap] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExam, setExpandedExam] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    const loadSubjectsData = async () => {
      try {
        // Fetch nested exam-subject-chapter map with completeness report
        const report = await browseService.getReport();
        setExamMap(report.exam_map);
        
        // Also fetch all subjects list as backup
        const list = await subjectService.listSubjects(1, 100);
        setSubjects(list);
      } catch (err) {
        console.error('Failed to fetch subjects data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSubjectsData();
  }, []);

  const handleChapterClick = (chapterId, chapterName, questionCount) => {
    if (questionCount < 1) {
      toast.error('This practice test is locked. Minimum 1 question required to practice.', {
        icon: '🔒',
        duration: 4000
      });
      return;
    }
    navigate(`/questions?chapter_id=${chapterId}&chapter_name=${encodeURIComponent(chapterName)}`);
  };

  const handleExamClick = (examId) => {
    setExpandedExam(expandedExam === examId ? null : examId);
    setExpandedSubject(null);
  };

  const handleSubjectClick = (e, subjectId) => {
    e.stopPropagation();
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8">
      {/* Background blobs */}
      <div className="bg-blob blob-purple top-1/4 right-0"></div>
      <div className="bg-blob blob-cyan bottom-10 left-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Browse by <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent text-glow">Subjects & Topics</span>
          </h1>
          <p className="text-slate-400">
            Select an exam below to browse its subjects, chapters, and practice questions.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="space-y-6">
            {examMap.map((exam, examIdx) => {
              const isExamExpanded = expandedExam === exam.id;
              
              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: examIdx * 0.05 }}
                  className={`glass rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
                    isExamExpanded ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : 'border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  {/* Exam Accordion Header */}
                  <div
                    onClick={() => handleExamClick(exam.id)}
                    className="p-6 flex items-center justify-between cursor-pointer select-none bg-slate-900/30 hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-inner text-indigo-400 font-bold">
                        <FaBookOpen />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-wide">{exam.exam_name}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 uppercase">
                            {exam.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
                        {exam.subjects.length} Subjects
                      </span>
                      <div className="text-slate-400">
                        {isExamExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>
                  </div>

                  {/* Exam Accordion Content (Subjects) */}
                  <AnimatePresence>
                    {isExamExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-slate-800/60 bg-slate-950/30"
                      >
                        <div className="p-6 space-y-4">
                          {exam.subjects.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 text-sm">
                              No subjects found for this exam.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {exam.subjects.map((subject) => {
                                const isSubExpanded = expandedSubject === subject.id;
                                
                                return (
                                  <div
                                    key={subject.id}
                                    onClick={(e) => handleSubjectClick(e, subject.id)}
                                    className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
                                      isSubExpanded 
                                        ? 'bg-slate-950 border-purple-500/20' 
                                        : 'bg-slate-950/50 hover:bg-slate-950 border-slate-850 hover:border-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <FaFolderOpen className="text-indigo-400/80" />
                                        <h4 className="font-semibold text-slate-200">{subject.name}</h4>
                                      </div>
                                      <div className="flex items-center gap-3 text-slate-400">
                                        <span className="text-xs text-slate-500">{subject.chapters.length} Topics</span>
                                        {isSubExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                                      </div>
                                    </div>

                                    {/* Chapters Sub-Accordion */}
                                    <AnimatePresence>
                                      {isSubExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="mt-4 pt-4 border-t border-slate-900 space-y-2 overflow-hidden"
                                        >
                                          {subject.chapters.length === 0 ? (
                                            <div className="text-slate-600 text-xs py-2">
                                              No chapters available.
                                            </div>
                                          ) : (
                                            subject.chapters.map((chapter) => {
                                              const isLocked = chapter.question_count < 1;
                                              return (
                                                <div
                                                  key={chapter.id}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChapterClick(chapter.id, chapter.name, chapter.question_count);
                                                  }}
                                                  className={`group flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                                    isLocked
                                                      ? 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed'
                                                      : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/40 hover:border-slate-800 cursor-pointer text-slate-350 hover:text-white'
                                                  }`}
                                                  title={isLocked ? 'Minimum 1 question required to practice.' : ''}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-slate-700' : 'bg-indigo-500'}`}></div>
                                                    <span className="text-sm font-medium transition-colors">
                                                      {chapter.name}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                    {isLocked ? (
                                                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                                        <FaExclamationTriangle className="text-[9px]" />
                                                        More Questions Needed
                                                      </span>
                                                    ) : (
                                                      <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/40">
                                                        <FaQuestionCircle className="text-[10px]" />
                                                        {chapter.question_count} MCQs
                                                      </span>
                                                    )}
                                                    
                                                    {isLocked ? (
                                                      <FaLock className="text-xs text-slate-700" />
                                                    ) : (
                                                      <FaArrowRight className="text-xs text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Subjects;
