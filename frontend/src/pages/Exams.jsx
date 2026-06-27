import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../api/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import { FaSearch, FaTrophy, FaCalendarAlt, FaSortAlphaDown, FaListUl, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Exams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [loading, setLoading] = useState(true);

  // Pagination parameters
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        // Fetch all categories to set filters
        const categoryData = await examService.getCategories();
        setCategories(categoryData);
        
        // Fetch list of exams based on search query, sorting, and pagination
        const examData = await examService.listExams(page, limit, searchQuery, sortBy);
        setExams(examData);
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [page, searchQuery, sortBy]);

  const handleExamClick = (examId, examName) => {
    navigate(`/subjects?exam_id=${examId}`);
  };

  // Get filtered exams based on local category selector
  const filteredExams = selectedCategory === 'All'
    ? exams
    : exams.filter(exam => exam.category.toLowerCase() === selectedCategory.toLowerCase());

  // Function to render a beautiful placeholder/gradient image for exams
  const renderExamLogo = (exam) => {
    const colors = [
      'from-blue-650 to-indigo-650',
      'from-purple-650 to-violet-650',
      'from-cyan-650 to-teal-650',
      'from-pink-650 to-rose-650',
      'from-amber-650 to-orange-650',
    ];
    
    // Choose gradient based on exam ID
    const index = exam.id % colors.length;
    const gradient = colors[index];

    return (
      <div className={`w-full h-36 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative p-6 overflow-hidden rounded-xl border-b border-slate-800/40`}>
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/30 border border-white/5 text-[10px] uppercase font-semibold text-slate-350 tracking-wider">
          {exam.category}
        </div>
        <FaTrophy className="text-white/20 text-5xl absolute -bottom-3 -right-3 rotate-12" />
        <h4 className="text-xl font-extrabold text-white text-center text-glow select-none drop-shadow-md z-10">
          {exam.exam_name}
        </h4>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8">
      {/* Background blobs */}
      <div className="bg-blob blob-indigo top-10 left-10"></div>
      <div className="bg-blob blob-cyan bottom-10 right-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Available <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent text-glow">Exams</span>
          </h1>
          <p className="text-slate-400">
            Select your specific targeted competitive examination database to access custom chapter-wise test banks.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="glass rounded-2xl p-6 border border-slate-800/80 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-xl text-slate-200 placeholder-slate-550 text-sm transition-all shadow-inner"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <FaSortAlphaDown /> Sort
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-350 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer"
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="year">Exam Year</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 px-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer border ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-900/60 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer border ${
                selectedCategory === cat.category
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Exam Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <>
            {filteredExams.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-slate-800/80">
                <FaListUl className="mx-auto text-4xl text-slate-650 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Exams Found</h3>
                <p className="text-slate-400 text-sm">
                  We couldn't find any exams matching your current search filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredExams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleExamClick(exam.id, exam.exam_name)}
                    className="glass rounded-2xl border border-slate-800/80 p-4 cursor-pointer relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 shadow-lg"
                  >
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    {renderExamLogo(exam)}

                    <div className="mt-4 flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                          {exam.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <FaCalendarAlt /> PYQ Bank
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {exam.exam_name}
                      </h3>
                      
                      <div className="flex gap-2 pt-1.5 border-t border-slate-900/60 group-hover:border-slate-800/60 transition-colors">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/subjects?exam_id=${exam.id}`);
                          }}
                          className="flex-1 py-1.5 text-center rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-750 text-[10px] font-semibold text-slate-350 transition-all cursor-pointer"
                        >
                          Chapters
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/test?exam_id=${exam.id}&test_type=mock`);
                          }}
                          className="flex-1 py-1.5 text-center rounded-lg bg-indigo-650 hover:bg-indigo-600 text-[10px] font-bold text-white shadow-sm transition-all cursor-pointer"
                        >
                          Mock Test
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {exams.length === limit && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-450 disabled:opacity-40 hover:text-white transition-all text-sm font-semibold disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-slate-400">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-450 hover:text-white transition-all text-sm font-semibold cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Exams;
