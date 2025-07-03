import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const AI_URL = process.env.REACT_APP_AI_URL || 'http://localhost:8000';

const getToken = () => localStorage.getItem('token');

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email: string, password: string) => api.post('/auth/login', { email, password });
export const signup = (username: string, email: string, password: string) => api.post('/auth/signup', { username, email, password });
export const getTasks = () => api.get('/tasks');
export const createTask = (data: any) => api.post('/tasks', data);
export const updateTask = (id: number, data: any) => api.patch(`/tasks/${id}`, data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);
export const completeTask = (id: number) => api.patch(`/tasks/${id}/complete`);
export const exportTasks = (type: 'csv' | 'excel' | 'pdf') => api.get(`/export/${type}`, { responseType: 'blob' });

export const predictCategory = (summary: string) => axios.post(`${AI_URL}/predict-category`, { summary }, { headers: { Authorization: `Bearer ${getToken()}` } });
export const generateDescription = (summary: string) => axios.post(`${AI_URL}/generate-description`, { summary }, { headers: { Authorization: `Bearer ${getToken()}` } });
export const getAdminReport = () => axios.get(`${AI_URL}/admin-report`, { headers: { Authorization: `Bearer ${getToken()}` } }); 