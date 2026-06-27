import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center py-12 px-4">
      {/* Background blobs */}
      <div className="bg-blob blob-indigo top-1/4 left-1/4"></div>
      <div className="bg-blob blob-purple bottom-1/4 right-1/4"></div>

      <div className="max-w-md w-full relative z-10 text-center space-y-6">
        
        {/* Animated Warning Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex bg-rose-500/10 p-5 rounded-full border border-rose-500/20 text-rose-455 shadow-xl shadow-rose-500/5 mb-4"
        >
          <FaExclamationTriangle className="text-5xl" />
        </motion.div>

        {/* 404 Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-7xl font-black bg-gradient-to-r from-rose-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent text-glow"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2.5"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Topic Not Found
          </h2>
          <p className="text-sm text-slate-450 leading-relaxed max-w-sm mx-auto">
            The page or question bank you are looking for has either been moved, deleted, or does not exist.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-650/20 hover:shadow-indigo-650/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <FaHome /> Return Home
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default NotFound;
