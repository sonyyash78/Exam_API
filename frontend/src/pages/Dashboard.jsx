import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { progressService, browseService } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/SkeletonLoader';
import { FaFire, FaTrophy, FaTasks, FaBookmark, FaRegClock, FaArrowRight, FaExclamationTriangle, FaChartLine, FaHeart, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    streak: 0,
    total_tests_attempted: 0,
    overall_accuracy: 0,
    average_score: 0,
    total_bookmarks: 0,
    totals: { correct: 0, incorrect: 0, skipped: 0 },
    weak_chapters: [],
    strong_chapters: [],
    recent_activity: []
  });
  const [report, setReport] = useState({ total_incomplete: 0, incomplete_chapters: [] });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const dashData = await progressService.getDashboard();
        setData(dashData);
        
        const completenessReport = await browseService.getReport();
        setReport(completenessReport);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="relative min-h-screen py-10 px-4 md:px-8">
      {/* Background blobs */}
      <div className="bg-blob blob-indigo top-10 left-10"></div>
      <div className="bg-blob blob-purple bottom-10 right-10"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent text-glow font-black">{user.name}</span>
            </h1>
            <p className="text-xs text-slate-450 mt-1">
              Track your preparation stats, streaks, bookmarks, and weak chapters.
            </p>
          </div>
          <Link
            to="/subjects"
            className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2"
          >
            Start Practice
            <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <>
            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { name: 'Daily Streak', val: data.streak, max: 'days', icon: <FaFire className="text-orange-500 animate-pulse" />, bg: 'from-orange-500/5 to-amber-500/5' },
                { name: 'Tests Attempted', val: data.total_tests_attempted, max: 'tests', icon: <FaTasks className="text-indigo-400" />, bg: 'from-indigo-500/5 to-blue-500/5' },
                { name: 'Avg Accuracy', val: `${Math.round(data.overall_accuracy)}%`, max: 'correctness', icon: <FaChartLine className="text-emerald-450" />, bg: 'from-emerald-500/5 to-teal-500/5' },
                { name: 'Bookmarks', val: data.total_bookmarks, max: 'questions', icon: <FaBookmark className="text-purple-400" />, bg: 'from-purple-500/5 to-pink-500/5' }
              ].map(stat => (
                <div key={stat.name} className={`glass p-6 rounded-2xl border border-slate-800/80 bg-gradient-to-br ${stat.bg} relative overflow-hidden group shadow-lg`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-450 uppercase font-semibold">{stat.name}</span>
                    <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-sm group-hover:scale-110 transition-transform">{stat.icon}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{stat.val}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">{stat.max}</div>
                </div>
              ))}
            </div>

            {/* Main Content Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (Strengths, Weaknesses, Warnings) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Warnings Card for Incomplete Chapters */}
                {report.total_incomplete > 0 && (
                  <div className="glass rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-3.5">
                    <div className="flex items-center gap-2.5 text-rose-400">
                      <FaExclamationTriangle className="text-lg animate-pulse" />
                      <h3 className="font-bold text-sm uppercase tracking-wide">Incomplete Topics Detected</h3>
                    </div>
                     <p className="text-xs text-slate-400 leading-relaxed">
                      The following topics have no questions. Practice tests for these chapters remain disabled until questions are added in the admin tab.
                    </p>
                    
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                      {report.incomplete_chapters.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-850/60 text-xs">
                          <span className="font-medium text-slate-300">{c.chapter_name} ({c.subject_name})</span>
                          <span className="font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/15">
                            {c.question_count} / 1 Q
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak & Strong Chapters Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Weak Chapters (< 50% accuracy) */}
                  <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Weak Areas
                    </h3>
                    
                    {data.weak_chapters.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">No weak areas identified. Good job!</p>
                    ) : (
                      <div className="space-y-3">
                        {data.weak_chapters.map((ch, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-300 truncate max-w-[70%]">{ch.name}</span>
                              <span className="font-bold text-rose-400">{Math.round(ch.accuracy)}% Accuracy</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${ch.accuracy}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Strong Chapters (>= 80% accuracy) */}
                  <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Strong Areas
                    </h3>
                    
                    {data.strong_chapters.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">Practice more tests to identify your strong topics!</p>
                    ) : (
                      <div className="space-y-3">
                        {data.strong_chapters.map((ch, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-300 truncate max-w-[70%]">{ch.name}</span>
                              <span className="font-bold text-emerald-400">{Math.round(ch.accuracy)}% Accuracy</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${ch.accuracy}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Recent activity card */}
                <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3">
                    Recent Test Attempts
                  </h3>
                  
                  {data.recent_activity.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No tests attempted yet. Click 'Start Practice' to begin!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.recent_activity.map((act) => (
                        <div
                          key={act.attempt_id}
                          onClick={() => navigate(`/result/${act.attempt_id}`)}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all cursor-pointer group"
                        >
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">
                              {act.title}
                            </h4>
                            <span className="text-[9px] font-semibold text-slate-550 uppercase">
                              {new Date(act.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-5">
                            <div className="text-right">
                              <div className="text-xs font-bold text-white">{Math.round(act.score)} / {Math.round(act.total)} pts</div>
                              <div className="text-[10px] text-slate-450">{Math.round(act.accuracy)}% Accuracy</div>
                            </div>
                            <FaChevronRight className="text-xs text-slate-650 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column (Leaderboard / Quick Navigation Links) */}
              <div className="space-y-6">
                
                {/* Leaderboard Card */}
                <div className="glass rounded-2xl border border-slate-800/80 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3 flex items-center gap-2">
                    <FaTrophy className="text-amber-500 animate-bounce" /> Hall of Fame
                  </h3>
                  
                  <LeaderboardWidget />
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

// Sub-Component to render leaderboard data
const LeaderboardWidget = () => {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const list = await progressService.getLeaderboard();
        setBoard(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, []);

  if (loading) return <div className="text-center py-4 text-slate-500 text-xs">Loading ranks...</div>;

  if (board.length === 0) return <div className="text-center py-4 text-slate-500 text-xs">No entries on the leaderboard.</div>;

  return (
    <div className="space-y-3">
      {board.map((item) => {
        let medal = null;
        if (item.rank === 1) medal = '🥇';
        else if (item.rank === 2) medal = '🥈';
        else if (item.rank === 3) medal = '🥉';

        return (
          <div key={item.rank} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-slate-500 w-5">
                {medal || `#${item.rank}`}
              </span>
              <div>
                <h4 className="font-bold text-slate-300">{item.name}</h4>
                <p className="text-[9px] text-slate-550">{item.tests_taken} Tests taken</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="font-bold text-indigo-400">{Math.round(item.total_score)} pts</span>
              <p className="text-[9px] text-slate-550">{Math.round(item.avg_accuracy)}% accuracy</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;
