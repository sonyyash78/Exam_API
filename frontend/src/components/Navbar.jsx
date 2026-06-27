import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaBars, FaTimes, FaSearch, FaHome, FaBookOpen, FaClipboardList, FaSignOutAlt, FaUnlockAlt, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <FaHome /> },
    { name: 'Subjects', path: '/subjects', icon: <FaBookOpen /> },
    { name: 'Exams', path: '/exams', icon: <FaClipboardList /> },
    { name: 'Search', path: '/search', icon: <FaSearch /> },
  ];

  // Dynamic links: Show Dashboard if authenticated
  const activeLinks = user
    ? [
        navLinks[0],
        { name: 'Dashboard', path: '/dashboard', icon: <FaChartLine /> },
        ...navLinks.slice(1),
      ]
    : navLinks;

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3 md:px-8">
      <div className="mx-auto max-w-7xl glass rounded-2xl px-6 py-4 flex items-center justify-between border border-slate-800/60 shadow-xl shadow-slate-950/20">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <FaGraduationCap className="text-2xl" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent tracking-wide">
            Exam<span className="text-indigo-400 font-extrabold text-glow">SIDE</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {activeLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`
              }
            >
              <span className="text-xs">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-660/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <FaUnlockAlt className="text-xs" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all duration-300 cursor-pointer"
              >
                <FaSignOutAlt className="text-sm" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-800/40 transition-colors cursor-pointer"
        >
          {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>

      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 mx-auto max-w-7xl glass rounded-2xl border border-slate-800/60 p-5 shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              {activeLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`
                  }
                >
                  <span className="text-sm">{link.icon}</span>
                  {link.name}
                </NavLink>
              ))}

              <div className="h-px bg-slate-800/60 my-2"></div>

              {user ? (
                <div className="flex flex-col gap-2.5">
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold bg-indigo-600 text-white shadow-lg"
                    >
                      <FaUnlockAlt />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-rose-400 hover:bg-rose-500/5 border border-rose-500/10 transition-all cursor-pointer"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold bg-slate-900 border border-slate-800 text-slate-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
