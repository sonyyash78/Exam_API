import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { progressService } from '../api/api';
import { TableSkeleton } from '../components/SkeletonLoader';
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaRegClock, FaChartPie, FaChevronDown, FaChevronUp, FaBook, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TestResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [expandedQId, setExpandedQId] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await progressService.getAttemptDetails(attemptId);
        setResult(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load performance results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  const toggleQuestionReveal = (qId) => {
    setExpandedQId(expandedQId === qId ? null : qId);
  };

  // Convert seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <TableSkeleton />
      </div>
    );
  }

  if (!result) return null;

  const { attempt_info, questions, subject_breakdown } = result;

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8">
      {/* Background blobs */}
      <div className="bg-blob blob-indigo top-10 left-10"></div>
      <div className="bg-blob blob-cyan bottom-10 right-10"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex bg-emerald-500/10 p-4 rounded-full border border-emerald-500/25 text-emerald-450 shadow-xl shadow-emerald-500/5 mb-2">
            <FaTrophy className="text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Performance Score Card</h1>
          <p className="text-xs text-slate-450 uppercase tracking-wider font-semibold">
            Test Attempt #{attempt_info.id} &bull; Submitted on {new Date(attempt_info.submitted_at).toLocaleDateString()}
          </p>
        </div>

        {/* Aggregate Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'Marks Earned', val: `${Math.round(attempt_info.score)} / ${Math.round(attempt_info.total_marks)}`, icon: <FaTrophy className="text-indigo-400" /> },
            { name: 'Accuracy', val: `${Math.round(attempt_info.accuracy)}%`, icon: <FaChartPie className="text-emerald-450" /> },
            { name: 'Time Taken', val: formatTime(attempt_info.time_taken), icon: <FaRegClock className="text-cyan-400" /> },
            { name: 'Attempts', val: `${attempt_info.correct_count}C / ${attempt_info.incorrect_count}W`, icon: <FaCheckCircle className="text-purple-400" /> }
          ].map(stat => (
            <div key={stat.name} className="glass p-5.5 rounded-2xl border border-slate-800/80 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{stat.name}</span>
                <span className="text-xs">{stat.icon}</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Subject-Wise Performance Breakdown */}
        <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
            <FaBook className="text-indigo-400" /> Subject-wise Performance
          </h3>
          
          <div className="space-y-4">
            {subject_breakdown.map((sub, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{sub.subject_name}</span>
                  <span className="font-bold text-slate-400">
                    {sub.correct} / {sub.total} Correct ({Math.round(sub.accuracy)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${sub.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Review Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FaHistory className="text-purple-450" /> Correction Log & Analysis ({questions.length})
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isExpanded = expandedQId === q.question_id;
              const isSkipped = q.selected_answer === null || q.selected_answer === '';
              
              return (
                <div
                  key={q.question_id}
                  className={`glass rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
                    q.is_correct
                      ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                      : isSkipped
                      ? 'border-slate-850'
                      : 'border-rose-500/20 bg-rose-500/[0.01]'
                  }`}
                >
                  {/* Collapsable Header */}
                  <div
                    onClick={() => toggleQuestionReveal(q.question_id)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        {q.is_correct ? (
                          <FaCheckCircle className="text-emerald-450 text-base" />
                        ) : isSkipped ? (
                          <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-900" title="Skipped"></div>
                        ) : (
                          <FaTimesCircle className="text-rose-450 text-base" />
                        )}
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Q. {idx + 1}</span>
                        <h4 className="text-sm font-semibold text-slate-200 line-clamp-1 mt-0.5 pr-4">
                          {q.question_text}
                        </h4>
                      </div>
                    </div>

                    <div className="text-slate-500 flex-shrink-0">
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>

                  {/* Expanded Solution View */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-900/60 space-y-4 text-sm font-light leading-relaxed">
                      
                      <div className="bg-slate-950/40 p-4.5 rounded-xl border border-slate-850 space-y-2.5 font-normal">
                        <p className="text-slate-200 font-semibold">{q.question_text}</p>
                        
                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                          {['A', 'B', 'C', 'D'].map(key => {
                            const optionText = q[`option_${key.toLowerCase()}`];
                            if (!optionText) return null;
                            
                            const isCorrect = q.correct_answer === key;
                            const isSelected = q.selected_answer === key;

                            return (
                              <div
                                key={key}
                                className={`p-2.5 rounded-lg border ${
                                  isCorrect
                                    ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-350'
                                    : isSelected
                                    ? 'border-rose-500/25 bg-rose-500/5 text-rose-350'
                                    : 'border-slate-900 bg-slate-950/20'
                                }`}
                              >
                                <span className="font-bold mr-1.5">{key}.</span> {optionText}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Answers detail */}
                      <div className="flex gap-4 text-xs font-semibold">
                        <div className="p-2 px-3 rounded-lg bg-slate-900 border border-slate-850">
                          Selected Answer: <span className={q.is_correct ? 'text-emerald-450' : 'text-rose-455'}>{q.selected_answer || 'Skipped'}</span>
                        </div>
                        <div className="p-2 px-3 rounded-lg bg-slate-900 border border-slate-850">
                          Correct Answer: <span className="text-emerald-450">{q.correct_answer}</span>
                        </div>
                      </div>

                      {/* Explanation card */}
                      <div className="p-4.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1.5">
                        <h5 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Solution Explanation</h5>
                        <p className="text-xs text-slate-350 leading-relaxed font-light">
                          {q.solution || 'No explanation provided.'}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-300 cursor-pointer"
          >
            Dashboard
          </Link>
          <Link
            to="/subjects"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg cursor-pointer"
          >
            Practice More
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TestResult;
