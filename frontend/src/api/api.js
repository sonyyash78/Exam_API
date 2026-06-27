import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://examapi-production.up.railway.app';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// --- API Service Calls ---

export const authService = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    
    const response = await API.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  signup: async (name, email, password) => {
    const response = await API.post('/api/auth/signup', { name, email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await API.get('/api/auth/me');
    return response.data;
  }
};

export const browseService = {
  getExamMap: async () => {
    const response = await API.get('/api/browse/exam-map');
    return response.data;
  },
  getStats: async () => {
    const response = await API.get('/api/browse/stats');
    return response.data;
  },
  getReport: async () => {
    const response = await API.get('/api/browse/report');
    return response.data;
  }
};

export const examService = {
  listExams: async (page = 1, limit = 20, search = '', sort = 'alphabetical') => {
    const params = { page, limit };
    if (search) params.search = search;
    if (sort) params.sort = sort;
    
    const response = await API.get('/api/exams/', { params });
    return response.data;
  },
  getCategories: async () => {
    const response = await API.get('/api/exams/categories');
    return response.data;
  },
  listExamsByCategory: async (category) => {
    const response = await API.get(`/api/exams/category/${category}`);
    return response.data;
  },
  getExamDetails: async (examId) => {
    const response = await API.get(`/api/exams/${examId}`);
    return response.data;
  },
  listSubjectsByExam: async (examId) => {
    const response = await API.get(`/api/exams/${examId}/subjects`);
    return response.data;
  },
  getMockTest: async (examId) => {
    const response = await API.get(`/api/exams/${examId}/mock-test`);
    return response.data;
  },
  createExam: async (examData) => {
    const response = await API.post('/api/exams/', examData);
    return response.data;
  },
  updateExam: async (examId, examData) => {
    const response = await API.put(`/api/exams/${examId}`, examData);
    return response.data;
  },
  deleteExam: async (examId) => {
    const response = await API.delete(`/api/exams/${examId}`);
    return response.data;
  }
};

export const subjectService = {
  listSubjects: async (page = 1, limit = 20, examId = null) => {
    const params = { page, limit };
    if (examId) params.exam_id = examId;
    
    const response = await API.get('/api/subjects/', { params });
    return response.data;
  },
  getSubjectDetails: async (subjectId) => {
    const response = await API.get(`/api/subjects/${subjectId}`);
    return response.data;
  },
  listChaptersBySubject: async (subjectId) => {
    const response = await API.get(`/api/subjects/${subjectId}/chapters`);
    return response.data;
  },
  createSubject: async (subjectData) => {
    const response = await API.post('/api/subjects/', subjectData);
    return response.data;
  },
  updateSubject: async (subjectId, subjectData) => {
    const response = await API.put(`/api/subjects/${subjectId}`, subjectData);
    return response.data;
  },
  deleteSubject: async (subjectId) => {
    const response = await API.delete(`/api/subjects/${subjectId}`);
    return response.data;
  }
};

export const chapterService = {
  listChaptersBySubject: async (subjectId) => {
    const response = await API.get(`/api/chapters/subject/${subjectId}`);
    return response.data;
  },
  getChapterDetails: async (chapterId) => {
    const response = await API.get(`/api/chapters/${chapterId}`);
    return response.data;
  },
  createChapter: async (chapterData) => {
    const response = await API.post('/api/chapters/', chapterData);
    return response.data;
  },
  updateChapter: async (chapterId, chapterData) => {
    const response = await API.put(`/api/chapters/${chapterId}`, chapterData);
    return response.data;
  },
  deleteChapter: async (chapterId) => {
    const response = await API.delete(`/api/chapters/${chapterId}`);
    return response.data;
  }
};

export const questionService = {
  listQuestionsByExam: async (examId, skip = 0, limit = 50) => {
    const response = await API.get(`/api/questions/exam/${examId}`, {
      params: { skip, limit }
    });
    return response.data;
  },
  listQuestionsByChapter: async (chapterId, skip = 0, limit = 50) => {
    const response = await API.get(`/api/questions/chapter/${chapterId}`, {
      params: { skip, limit }
    });
    return response.data;
  },
  submitAnswer: async (questionId, selectedAnswer) => {
    const response = await API.post('/api/questions/submit-answer', {
      question_id: questionId,
      selected_answer: selectedAnswer
    });
    return response.data;
  },
  getQuestionDetails: async (questionId) => {
    const response = await API.get(`/api/questions/${questionId}`);
    return response.data;
  },
  createQuestion: async (questionData) => {
    const response = await API.post('/api/questions/', questionData);
    return response.data;
  },
  updateQuestion: async (questionId, questionData) => {
    const response = await API.put(`/api/questions/${questionId}`, questionData);
    return response.data;
  },
  deleteQuestion: async (questionId) => {
    const response = await API.delete(`/api/questions/${questionId}`);
    return response.data;
  },
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post('/api/questions/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export const progressService = {
  getDashboard: async () => {
    const response = await API.get('/api/progress/dashboard');
    return response.data;
  },
  saveAttempt: async (attemptData) => {
    const response = await API.post('/api/progress/test-attempts', attemptData);
    return response.data;
  },
  getAttemptDetails: async (attemptId) => {
    const response = await API.get(`/api/progress/test-attempts/${attemptId}`);
    return response.data;
  },
  toggleBookmark: async (questionId) => {
    const response = await API.post(`/api/progress/bookmark/${questionId}`);
    return response.data;
  },
  getBookmarks: async () => {
    const response = await API.get('/api/progress/bookmarks');
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await API.get('/api/progress/leaderboard');
    return response.data;
  }
};

export default API;
