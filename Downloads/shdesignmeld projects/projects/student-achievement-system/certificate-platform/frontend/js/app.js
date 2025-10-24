// API Configuration
const API_URL = 'http://localhost:5000/api';

// Utility Functions
const showAlert = (message, type = 'success') => {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
};

const getToken = () => localStorage.getItem('token');

const setToken = (token) => localStorage.setItem('token', token);

const removeToken = () => localStorage.removeItem('token');

const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

const removeUser = () => localStorage.removeItem('user');

const isAuthenticated = () => !!getToken();

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Check authentication on protected pages
const checkAuth = () => {
  const protectedPages = ['dashboard.html'];
  const currentPage = window.location.pathname.split('/').pop();

  if (protectedPages.includes(currentPage) && !isAuthenticated()) {
    window.location.href = 'login.html';
  }

  if ((currentPage === 'login.html' || currentPage === 'register.html') && isAuthenticated()) {
    window.location.href = 'dashboard.html';
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

// Export for use in other files
window.app = {
  API_URL,
  showAlert,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  apiRequest,
};