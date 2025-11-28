import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.token) setError(res.message || 'Login failed');
        else onClose();
      } else {
        const res = await register(email, password);
        if (!res.token) setError(res.message || 'Register failed');
        else onClose();
      }
    } catch (e) {
      setError(e.message || 'Action failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h3>
          <button className="p-1 hover:bg-gray-100 rounded" onClick={onClose}><X className="w-5 h-5"/></button>
        </div>
        <input placeholder="Email" className="w-full mb-2 p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" className="w-full mb-2 p-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
        <div className="flex justify-end items-center space-x-2">
          <button className="px-3 py-1 text-sm text-gray-700" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={submit}>{mode === 'login' ? 'Login' : 'Register'}</button>
        </div>
      </div>
    </div>
  );
}
