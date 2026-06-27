import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import Exams from './pages/Exams';
import Questions from './pages/Questions';
import Search from './pages/Search';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import TestInterface from './pages/TestInterface';
import TestResult from './pages/TestResult';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
          
          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />

          {/* Header Area */}
          <Navbar />

          {/* Main Layout Area */}
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              
              {/* Student Features */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/test" element={<TestInterface />} />
              <Route path="/result/:attemptId" element={<TestResult />} />
              
              {/* Admin Features */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer Area */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
