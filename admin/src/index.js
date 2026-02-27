import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';
import { PermissionProvider } from './components/PermissionContext';

// Set up axios interceptor to automatically attach token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const container = document.getElementById('root');
const root = createRoot(container);

// Redirect unauthenticated users from /admin root to login
try {
  if (
    (window.location.pathname === '/admin' || window.location.pathname === '/admin/') &&
    !localStorage.getItem('authToken')
  ) {
    window.history.replaceState({}, '', '/admin/login');
  }
} catch (e) {
  // ignore in environments where localStorage is unavailable
}

root.render(
  <PermissionProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </PermissionProvider>
);