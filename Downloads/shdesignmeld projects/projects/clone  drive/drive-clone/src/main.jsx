import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './AuthProvider'

// Storage fallback: use localStorage if `window.storage` is not provided
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key)
      return value ? { value } : null
    },
    async set(key, value) {
      localStorage.setItem(key, value)
    }
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
