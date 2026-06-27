import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full mt-auto border-t border-slate-900 bg-slate-950/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl text-white">
                <FaGraduationCap className="text-xl" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                Exam<span className="text-indigo-400">SIDE</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Prepare for your competitive exams with our comprehensive database of past year questions, smart practice features, and analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/subjects" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Subjects</Link>
              </li>
              <li>
                <Link to="/exams" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Exams</Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Search Questions</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Connect</h3>
            <div className="flex gap-3.5">
              <a href="#" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300">
                <FaGithub className="text-lg" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300">
                <FaTwitter className="text-lg" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300">
                <FaLinkedin className="text-lg" />
              </a>
              <a href="mailto:info@examside.com" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300">
                <FaEnvelope className="text-lg" />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Email: info@examside.com
            </p>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} ExamSIDE. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
