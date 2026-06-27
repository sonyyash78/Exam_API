import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { questionService } from '../api/api';
import { QuestionSkeleton } from '../components/SkeletonLoader';
import { FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight, FaInfoCircle, FaSearch, FaArrowLeft, FaRegLightbulb, FaTrophy, FaRedo, FaList } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Questions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chapterId = searchParams.get('chapter_id');
  const chapterName = searchParams.get('chapter_name') || 'Chapter Practice';
  const examId = searchParams.get('exam_id');
  const examName = searchParams.get('exam_name') || 'Exam Practice';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quiz states
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: { selected, isCorrect, correctAnswer, solution } }
  const [submittingId, setSubmittingId] = useState(null);

  // Score states
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const limit = 10;
  const skip = (page - 1) * limit;

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let data = [];
        if (chapterId) {
          data = await questionService.listQuestionsByChapter(chapterId, skip, limit);
        } else if (examId) {
          data = await questionService.listQuestionsByExam(examId, skip, limit);
        } else {
          // Default fallbacks to load something
          data = await questionService.listQuestionsByExam(1, skip, limit);
        }
        setQuestions(data);
      } catch (err) {
        console.error('Failed to load questions:', err);
        toast.error('Failed to retrieve questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [chapterId, examId, page]);

  const handleOptionClick = async (questionId, optionKey) => {
    // If already answered, do nothing
    if (userAnswers[questionId]) return;

    setSubmittingId(questionId);
    try {
      const response = await questionService.submitAnswer(questionId, optionKey);
      // Response format: { question_id, is_correct, correct_answer, solution }
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: {
          selected: optionKey,
          isCorrect: response.is_correct,
          correctAnswer: response.correct_answer,
          solution: response.solution || 'No explanation provided.'
        }
      }));

      // Update score tracking
      setAttempted(prev => prev + 1);
      if (response.is_correct) {
        setScore(prev => prev + 1);
        toast.success('Correct Answer!', { icon: '🎉' });
      } else {
        toast.error(`Incorrect! Correct Answer is option ${response.correct_answer}`, { icon: '❌' });
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      toast.error('Failed to check answer.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRevealAnswer = async (questionId) => {
    if (userAnswers[questionId]) return;
    
    setSubmittingId(questionId);
    try {
      // Call with dummy answer to reveal correct answer and explanation
      const response = await questionService.submitAnswer(questionId, 'X');
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: {
          selected: null,
          isCorrect: false,
          correctAnswer: response.correct_answer,
          solution: response.solution || 'No explanation provided.'
        }
      }));
      
      // Update score tracking as attempted (unanswered reveal)
      setAttempted(prev => prev + 1);
    } catch (err) {
      console.error('Failed to reveal answer:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleResetSession = () => {
    setUserAnswers({});
    setScore(0);
    setAttempted(0);
    setShowScoreModal(false);
    toast.success('Practice session reset!');
  };

  // Filter questions client-side based on search query
  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate encouraging summary message
  const getSummaryMessage = () => {
    const accuracy = attempted > 0 ? (score / attempted) * 100 : 0;
    if (accuracy >= 80) return 'Excellent job! You have fully mastered this topic. Keep it up!';
    if (accuracy >= 50) return 'Good effort! Review the detailed solutions for questions you missed to improve.';
    return 'Keep practicing! Re-read the chapters and attempt these questions again to build confidence.';
  };

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8">
      {/* Background blobs */}
      <div className="bg-blob blob-purple top-10 right-10"></div>
      <div className="bg-blob blob-cyan bottom-10 left-10"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/subjects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
          >
            <FaArrowLeft /> Back to Subjects
          </Link>
          
          {/* Running Score Tracker */}
          {attempted > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium flex items-center gap-2">
                <span>Attempted: <strong className="text-slate-200">{attempted}</strong></span>
                <span className="text-slate-700">|</span>
                <span>Score: <strong className="text-emerald-450">{score}</strong></span>
              </div>
              <button
                onClick={() => setShowScoreModal(true)}
                className="px-4 py-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
              >
                Submit Exam & Score
              </button>
            </div>
          )}
        </div>

        {/* Title / Description */}
        <div className="glass rounded-2xl p-6 border border-slate-800/80 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {chapterId ? chapterName : examName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Test your knowledge by picking the correct options.
            </p>
          </div>
          
          {/* Search within questions */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search in questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-xl text-slate-350 placeholder-slate-550 text-xs transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Question Cards Stack */}
        {loading ? (
          <div className="space-y-6">
            <QuestionSkeleton />
            <QuestionSkeleton />
          </div>
        ) : (
          <>
            {filteredQuestions.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-slate-800/80">
                <FaInfoCircle className="mx-auto text-4xl text-slate-650 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Questions Found</h3>
                <p className="text-slate-400 text-sm">
                  There are no questions loaded in this topic matching your search criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredQuestions.map((q, index) => {
                  const state = userAnswers[q.id];
                  const hasAnswered = !!state;

                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass rounded-2xl border border-slate-800/80 p-6 sm:p-8 shadow-xl relative"
                    >
                      {/* Year Indicator */}
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-3">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                          Q. {skip + index + 1}
                        </span>
                        {q.year && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                            {q.exam_session || `${q.year}`}
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-6 leading-relaxed">
                        {q.question}
                      </h3>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 gap-3.5 mb-6">
                        {[
                          { key: 'A', text: q.option_a },
                          { key: 'B', text: q.option_b },
                          { key: 'C', text: q.option_c },
                          { key: 'D', text: q.option_d },
                        ].map((opt) => {
                          if (!opt.text) return null;
                          
                          // Determine styles based on state
                          let optionStyle = 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700 text-slate-300';
                          let icon = null;

                          if (hasAnswered) {
                            const isSelected = state.selected === opt.key;
                            const isCorrectAnswer = state.correctAnswer === opt.key;

                            if (isCorrectAnswer) {
                              optionStyle = 'border-emerald-500/45 bg-emerald-500/10 text-emerald-350 font-semibold';
                              icon = <FaCheckCircle className="text-emerald-400 text-sm flex-shrink-0" />;
                            } else if (isSelected) {
                              optionStyle = 'border-rose-500/45 bg-rose-500/10 text-rose-350 font-semibold';
                              icon = <FaTimesCircle className="text-rose-400 text-sm flex-shrink-0" />;
                            } else {
                              optionStyle = 'border-slate-900 bg-slate-950/20 text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={opt.key}
                              disabled={hasAnswered || submittingId === q.id}
                              onClick={() => handleOptionClick(q.id, opt.key)}
                              className={`flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer ${optionStyle} ${
                                !hasAnswered && 'hover:-translate-y-0.5'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 pr-2">
                                <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                                  hasAnswered && state.correctAnswer === opt.key
                                    ? 'bg-emerald-500/20 text-emerald-450'
                                    : hasAnswered && state.selected === opt.key
                                    ? 'bg-rose-500/20 text-rose-450'
                                    : 'bg-slate-900 text-slate-400'
                                }`}>
                                  {opt.key}
                                </span>
                                <span className="leading-relaxed">{opt.text}</span>
                              </div>
                              {icon}
                            </button>
                          );
                        })}
                      </div>

                      {/* Controls Area */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          {!hasAnswered && (
                            <button
                              onClick={() => handleRevealAnswer(q.id)}
                              disabled={submittingId === q.id}
                              className="text-xs font-semibold text-slate-450 hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <FaRegLightbulb /> Show Answer
                            </button>
                          )}
                        </div>

                        {hasAnswered && state.selected && (
                          <div className={`text-xs font-bold flex items-center gap-1.5 ${
                            state.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {state.isCorrect ? 'Correct!' : 'Incorrect'}
                          </div>
                        )}
                      </div>

                      {/* Detailed Solution Accordion */}
                      <AnimatePresence>
                        {hasAnswered && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 pt-5 border-t border-slate-800/60 overflow-hidden"
                          >
                            <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-5 space-y-2">
                              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                <FaRegLightbulb className="text-amber-400" /> Explanation & Solution
                              </h4>
                              <p className="text-sm text-slate-350 leading-relaxed font-light">
                                {state.solution}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-10 px-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-400 disabled:opacity-30 hover:text-white transition-all text-xs font-bold disabled:cursor-not-allowed cursor-pointer"
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Page {page}
              </span>
              <button
                disabled={questions.length < limit}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-400 disabled:opacity-30 hover:text-white transition-all text-xs font-bold disabled:cursor-not-allowed cursor-pointer"
              >
                Next <FaChevronRight />
              </button>
            </div>
          </>
        )}

      </div>

      {/* --- SCORE SUMMARY MODAL --- */}
      <AnimatePresence>
        {showScoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-md w-full border border-slate-800 shadow-2xl relative text-center space-y-6 bg-slate-950/20"
            >
              <div className="inline-flex bg-gradient-to-r from-indigo-500 to-purple-500 p-4.5 rounded-full text-white shadow-xl shadow-indigo-500/10">
                <FaTrophy className="text-3xl" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-white">Practice Score Card</h3>
                <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
                  {chapterId ? chapterName : examName}
                </p>
              </div>

              {/* Progress visual */}
              <div className="py-4 flex justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center rounded-full bg-slate-900 border-4 border-slate-800">
                  {/* Glowing core */}
                  <div className="absolute inset-2.5 bg-slate-950 rounded-full flex flex-col justify-center items-center shadow-inner">
                    <span className="text-3xl font-black text-white">{score} / {attempted}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Correct</span>
                  </div>
                </div>
              </div>

              {/* Stats Table */}
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Accuracy</span>
                  <div className="text-lg font-bold text-indigo-400">
                    {attempted > 0 ? Math.round((score / attempted) * 100) : 0}%
                  </div>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Incorrect</span>
                  <div className="text-lg font-bold text-rose-400">
                    {attempted - score}
                  </div>
                </div>
              </div>

              {/* Evaluation Message */}
              <p className="text-sm text-slate-350 leading-relaxed italic">
                "{getSummaryMessage()}"
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <button
                  onClick={handleResetSession}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FaRedo /> Restart
                </button>
                <button
                  onClick={() => {
                    setShowScoreModal(false);
                    navigate('/subjects');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FaList /> View Subjects
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowScoreModal(false)}
                className="absolute top-2 right-4 text-slate-500 hover:text-white text-lg p-2 font-bold cursor-pointer"
              >
                &times;
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Questions;
