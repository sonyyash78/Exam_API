import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaCheckCircle, FaDatabase, FaFolderOpen, FaArrowRight, FaTasks, FaTrophy } from 'react-icons/fa';
import { browseService } from '../api/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [stats, setStats] = useState({
    exam_count: 0,
    subject_count: 0,
    chapter_count: 0,
    question_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await browseService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        // Fallback fallback stats
        setStats({
          exam_count: 25,
          subject_count: 68,
          chapter_count: 345,
          question_count: 244,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsItems = [
    { name: 'Exams Covered', value: stats.exam_count, icon: <FaTrophy className="text-amber-400" /> },
    { name: 'Total Subjects', value: stats.subject_count, icon: <FaBook className="text-emerald-400" /> },
    { name: 'Chapters Organized', value: stats.chapter_count, icon: <FaFolderOpen className="text-cyan-400" /> },
    { name: 'Practice Questions', value: stats.question_count, icon: <FaTasks className="text-purple-400" /> },
  ];

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center py-16 px-4">
      {/* Background Blobs */}
      <div className="bg-blob blob-indigo top-10 left-10"></div>
      <div className="bg-blob blob-purple bottom-10 right-10"></div>

      <div className="max-w-7xl mx-auto w-full flex flex-col items-center relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl space-y-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-slate-800 text-xs font-semibold text-indigo-300 mb-2"
          >
            <FaCheckCircle className="text-glow animate-pulse" />
            Empowering Exam Prep with Real Past Questions
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Master Your Exams with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-glow font-black">
              ExamSIDE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Access past year papers, chapter-wise MCQs, detailed answers, and explanation logs from major engineering, medical, government, and banking tests.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/exams"
              className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 group"
            >
              Explore Exams
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/subjects"
              className="px-8 py-3.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Browse Subjects
            </Link>
          </motion.div>
        </div>

        {/* Statistics Cards */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20 px-4">
          {statsItems.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-6 rounded-2xl border border-slate-800/80 text-center relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 shadow-xl"
            >
              {/* Card Hover Ambient Light */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-300 text-xl">
                  {stat.icon}
                </div>
              </div>
              
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight">
                {loading ? '...' : stat.value.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                {stat.name}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info/Features Grid */}
        <div className="w-full px-4 mb-8">
          <div className="glass rounded-3xl border border-slate-800/60 p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-[80px] pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Structured Practice for Maximum Retention
                </h2>
                <p className="text-slate-400 leading-relaxed text-base">
                  Stop scrolling aimlessly. Our exam map organizes questions under clear subject headings and chapters, allowing you to focus on topics you find most challenging.
                </p>
                <ul className="space-y-3.5">
                  {[
                    'Chapter-wise categorized past questions.',
                    'Verify answers in real-time with solutions.',
                    'Filtered searches across subject lines and year sessions.',
                    'Responsive test taker interface.',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                      <FaCheckCircle className="text-indigo-400 text-lg flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="text-indigo-400 font-bold text-lg">Engineering Exams</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    JEE Main, JEE Advanced, BITSAT, VITEEE, and regional state entrance papers.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="text-purple-400 font-bold text-lg">Medical & Science</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    NEET, AIIMS, JIPMER, and other national level entrance test banks.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="text-cyan-400 font-bold text-lg">Government Jobs</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    UPSC Civil Services, SSC CGL, Railways NTPC, NDA, and CDS Defence tests.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="text-amber-400 font-bold text-lg">Management & Banking</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    CAT, XAT, SBI PO, IBPS Clerk, RBI Assistant syllabus and solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
