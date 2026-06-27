import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { examService, questionService, progressService } from '../api/api';
import { QuestionSkeleton } from '../components/SkeletonLoader';
import { FaClock, FaCheck, FaBookmark, FaRegFlag, FaExpandArrowsAlt, FaTimes, FaAngleRight, FaAngleLeft, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TestInterface = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('exam_id');
  const chapterId = searchParams.get('chapter_id');
  const testType = searchParams.get('test_type') || 'mock'; // "mock" or "practice"

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to start the test.');
      navigate('/login');
    }
  }, [navigate]);
  
  // Test states
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  
  // Navigation index
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Palette states
  const [statusPalette, setStatusPalette] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState({});

  // Timer states
  const [timeLeft, setTimeLeft] = useState(1800);
  const timerRef = useRef(null);

  const storageKey = `test_session_${testType}_${chapterId || examId}`;

  useEffect(() => {
    const fetchQuestionsData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (testType === 'mock' && examId) {
          const testData = await examService.getMockTest(examId);
          if (!testData.questions || testData.questions.length === 0) {
            throw new Error('No questions returned from the server for this exam.');
          }
          setExamInfo(testData);
          setQuestions(testData.questions);
          setTimeLeft(testData.duration_minutes * 60);
          
          const initialPalette = {};
          testData.questions.forEach(q => {
            initialPalette[q.id] = 'not_visited';
          });
          setStatusPalette(initialPalette);
        } else if (testType === 'practice' && chapterId) {
          const data = await questionService.listQuestionsByChapter(chapterId, 0, 10);
          if (!data || data.length === 0) {
            throw new Error('No questions returned from the server for this topic.');
          }
          setQuestions(data);
          setTimeLeft(10 * 60);
          
          const initialPalette = {};
          data.forEach(q => {
            initialPalette[q.id] = 'not_visited';
          });
          setStatusPalette(initialPalette);
        }
      } catch (err) {
        console.error('Failed to load test setup:', err);
        const errMsg = err.response?.data?.detail || err.message || 'Failed to assemble test questions. Make sure the backend server is running locally and database columns are migrated.';
        setError(errMsg);
        toast.error('Failed to load test questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsData();
  }, [examId, chapterId, testType]);

  // Handle local session resume
  useEffect(() => {
    if (questions.length > 0) {
      const savedSession = localStorage.getItem(storageKey);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setSelectedAnswers(parsed.answers || {});
          setStatusPalette(parsed.palette || {});
          setTimeLeft(parsed.timeLeft || timeLeft);
          setQuestionTimeSpent(parsed.timeSpent || {});
          toast.success('Resumed previous test session.');
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [questions]);

  // Local storage auto-saver
  useEffect(() => {
    if (started && questions.length > 0) {
      const saveState = () => {
        localStorage.setItem(storageKey, JSON.stringify({
          answers: selectedAnswers,
          palette: statusPalette,
          timeLeft: timeLeft,
          timeSpent: questionTimeSpent
        }));
      };
      saveState();
    }
  }, [selectedAnswers, statusPalette, timeLeft, questionTimeSpent, started]);

  // Timer handlers
  useEffect(() => {
    if (started && timeLeft > 0 && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest(true);
            return 0;
          }
          return prev - 1;
        });
        
        const currentQ = questions[currentIdx];
        if (currentQ) {
          setQuestionTimeSpent(prev => ({
            ...prev,
            [currentQ.id]: (prev[currentQ.id] || 0) + 1
          }));
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [started, currentIdx, questions]);

  // Track Visited status
  useEffect(() => {
    if (started && questions.length > 0) {
      const currentQ = questions[currentIdx];
      if (currentQ && statusPalette[currentQ.id] === 'not_visited') {
        setStatusPalette(prev => ({
          ...prev,
          [currentQ.id]: 'visited'
        }));
      }
    }
  }, [currentIdx, started, questions]);

  const handleStartTest = () => {
    setStarted(true);
  };

  const handleSelectOption = (optionKey) => {
    const currentQ = questions[currentIdx];
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionKey
    }));
    
    setStatusPalette(prev => ({
      ...prev,
      [currentQ.id]: 'answered'
    }));
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentIdx];
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });

    setStatusPalette(prev => ({
      ...prev,
      [currentQ.id]: 'visited'
    }));
  };

  const handleMarkForReview = () => {
    const currentQ = questions[currentIdx];
    setStatusPalette(prev => ({
      ...prev,
      [currentQ.id]: 'marked_for_review'
    }));
    handleNext();
  };

  const handleSaveAndNext = () => {
    const currentQ = questions[currentIdx];
    if (selectedAnswers[currentQ.id]) {
      setStatusPalette(prev => ({
        ...prev,
        [currentQ.id]: 'answered'
      }));
    } else {
      setStatusPalette(prev => ({
        ...prev,
        [currentQ.id]: 'visited'
      }));
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmitTest = async (isAuto = false) => {
    clearInterval(timerRef.current);
    const toastId = toast.loading(isAuto ? 'Time limit reached. Submitting test...' : 'Submitting attempt...');
    
    try {
      const qAttempts = questions.map(q => ({
        question_id: q.id,
        selected_answer: selectedAnswers[q.id] || null,
        time_spent: questionTimeSpent[q.id] || 0
      }));

      const duration = testType === 'mock' && examInfo ? examInfo.duration_minutes * 60 : 600;
      const timeTaken = duration - timeLeft;

      const attemptPayload = {
        test_type: testType,
        target_id: parseInt(chapterId || examId),
        time_taken: Math.max(1, timeTaken),
        question_attempts: qAttempts
      };

      const result = await progressService.saveAttempt(attemptPayload);
      localStorage.removeItem(storageKey);
      
      toast.success('Test submitted successfully!', { id: toastId });
      navigate(`/result/${result.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit test attempts.', { id: toastId });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error('Fullscreen mode blocked by browser.');
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <QuestionSkeleton />
      </div>
    );
  }

  // --- ERROR DISPLAY OVERLAY ---
  if (error || questions.length === 0) {
    return (
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-md w-full glass rounded-3xl p-8 border border-slate-800 text-center space-y-6 shadow-2xl relative">
          <div className="inline-flex bg-rose-500/10 p-5 rounded-full border border-rose-500/20 text-rose-400">
            <FaExclamationTriangle className="text-3xl" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Cannot Start Test</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'No questions are configured for this mock test. To run mock tests, please configure the local backend server.'}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- PRE-TEST INSTRUCTIONS OVERLAY ---
  if (!started) {
    const pos = examInfo?.positive_marks_default || 4.0;
    const neg = examInfo?.negative_marks_default || -1.0;

    return (
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full glass rounded-3xl p-8 border border-slate-800 shadow-2xl relative space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Test Instructions</h2>
            <p className="text-xs text-indigo-400 font-bold uppercase">{examInfo?.exam_name || 'Practice Mode'}</p>
          </div>

          <div className="text-sm text-slate-350 space-y-3.5 leading-relaxed bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
            <div className="flex justify-between font-semibold border-b border-slate-800 pb-2">
              <span>Total Questions:</span>
              <span className="text-white">{questions.length}</span>
            </div>
            <div className="flex justify-between font-semibold border-b border-slate-800 pb-2">
              <span>Total Time:</span>
              <span className="text-white">{testType === 'mock' ? `${examInfo?.duration_minutes} minutes` : '10 minutes'}</span>
            </div>
            <div className="flex justify-between font-semibold border-b border-slate-800 pb-2">
              <span>Marking Scheme:</span>
              <span className="text-emerald-400">+{pos} <span className="text-slate-500">/</span> <span className="text-rose-400">{neg}</span></span>
            </div>

            <div className="pt-2 text-xs space-y-2 text-slate-400 list-disc pl-4 font-light">
              <li>Do not refresh the page or navigate away during the exam.</li>
              <li>Auto-save will preserve your marked choices in case of power or network drops.</li>
              <li>You can view individual questions via the sidebar color palette.</li>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-400 transition-colors cursor-pointer"
            >
              Go Back
            </button>
            <button
              onClick={handleStartTest}
              className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              Start Exam <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const selectedAnswer = selectedAnswers[currentQ?.id];

  const getPaletteColorClass = (qId) => {
    const status = statusPalette[qId];
    if (status === 'answered') return 'bg-emerald-500 border-emerald-400 text-white';
    if (status === 'marked_for_review') return 'bg-purple-500 border-purple-400 text-white';
    if (status === 'visited') return 'bg-rose-500 border-rose-400 text-white';
    return 'bg-slate-900 border-slate-800 text-slate-400';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 py-8 px-4 max-w-7xl mx-auto w-full relative z-10">
      
      {/* LEFT COLUMN: Question Panel */}
      <div className="flex-grow lg:w-3/4 flex flex-col space-y-6">
        
        {/* Header bar: Timer */}
        <div className="glass rounded-2xl p-4 border border-slate-850 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Current Question</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-indigo-400">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-glow text-sm font-mono font-black text-indigo-300">
              <FaClock className="animate-pulse" />
              {formatTime(timeLeft)}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-450 hover:text-white transition-colors cursor-pointer text-xs"
              title="Fullscreen Mode"
            >
              <FaExpandArrowsAlt />
            </button>
          </div>
        </div>

        {/* Question Pane */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 flex-grow flex flex-col justify-between min-h-[50vh]">
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 text-xs text-slate-500">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider">
                Type: {currentQ?.question_type?.toUpperCase()}
              </span>
              <span>Marks: +{currentQ?.marks} | -{currentQ ? Math.abs(currentQ.negative_marks) : 1}</span>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
              {currentQ?.question}
            </h3>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {[
                { key: 'A', text: currentQ?.option_a },
                { key: 'B', text: currentQ?.option_b },
                { key: 'C', text: currentQ?.option_c },
                { key: 'D', text: currentQ?.option_d },
              ].map((opt) => {
                if (!opt.text) return null;
                const isSelected = selectedAnswer === opt.key;
                
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-500/10 text-indigo-300 font-semibold'
                        : 'border-slate-855 bg-slate-955/40 hover:bg-slate-900/60 hover:border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                      isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-900/60">
            <div className="flex gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-slate-450 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FaAngleLeft /> Previous
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 hover:text-rose-400 text-xs font-semibold text-slate-450 transition-colors cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMarkForReview}
                className="px-4 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15 text-purple-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FaRegFlag /> Mark for Review
              </button>
              <button
                onClick={handleSaveAndNext}
                className="px-6 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white shadow-md transition-colors cursor-pointer flex items-center gap-1"
              >
                Save & Next <FaAngleRight />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Question Palette */}
      <div className="lg:w-1/4 flex flex-col space-y-6">
        
        <div className="glass rounded-3xl p-6 border border-slate-800 shadow-lg space-y-6">
          <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wide border-b border-slate-900 pb-3">
            Question Palette
          </h4>

          <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${getPaletteColorClass(q.id)} ${
                  currentIdx === idx ? 'ring-2 ring-indigo-400/80 ring-offset-2 ring-offset-slate-950' : ''
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-900/60 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500"></span> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-rose-500"></span> Visited / Skipped
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-purple-500"></span> Marked for Review
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800"></span> Not Visited
            </div>
          </div>

          <div className="h-px bg-slate-900"></div>

          <button
            onClick={() => handleSubmitTest(false)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/15 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FaCheck /> Submit Test
          </button>
        </div>

      </div>

    </div>
  );
};

export default TestInterface;
