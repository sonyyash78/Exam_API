import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/api';
import { FaGraduationCap, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (isSignUp && !name.trim())) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up Flow
        await authService.signup(name, email, password);
        toast.success('Account created successfully! Please sign in.');
        setIsSignUp(false);
        setName('');
      } else {
        // Login Flow
        const userProfile = await login(email, password);
        toast.success(`Welcome back, ${userProfile.name}!`);
        if (userProfile.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="bg-blob blob-indigo top-1/4 left-1/4"></div>
      <div className="bg-blob blob-purple bottom-1/4 right-1/4"></div>

      <div className="max-w-md w-full relative z-10">
        
        {/* Header banner */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/10">
            <FaGraduationCap className="text-3xl animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isSignUp ? 'Join ExamSIDE' : 'Access ExamSIDE'}
          </h2>
          <p className="text-xs text-slate-455">
            {isSignUp ? 'Create a student account to track your test progress.' : 'Log in to manage database questions, subjects, and exams.'}
          </p>
        </div>

        {/* Card Form */}
        <div className="glass rounded-3xl p-8 border border-slate-800/80 shadow-2xl relative bg-slate-950/20 backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Name Field (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <FaUser className="text-indigo-400" /> Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-4 pr-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/80 rounded-xl text-slate-250 placeholder-slate-600 text-sm transition-all shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <FaEnvelope className="text-indigo-400" /> Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/80 rounded-xl text-slate-250 placeholder-slate-600 text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <FaLock className="text-indigo-400" /> Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-4 pr-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/80 rounded-xl text-slate-250 placeholder-slate-600 text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? <FaUserPlus /> : <FaSignInAlt />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>

          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center border-t border-slate-900/60 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="text-xs font-semibold text-indigo-455 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : "New to ExamSIDE? Create an Account"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
