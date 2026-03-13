'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', text: 'Signing in...' });

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStatus({ type: 'success', text: 'Logged in successfully! Redirecting...' });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'Something went wrong.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-[#111] selection:bg-black selection:text-white">
      <Link href="/" className="mb-8 text-sm font-medium text-gray-500 hover:text-black transition-colors">
        &larr; Back to Home
      </Link>
      
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {status.text && (
            <div className={`p-4 rounded-xl text-sm ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
              {status.text}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#fafafa]"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#fafafa]"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={status.type === 'loading'}
            className="w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-black hover:underline cursor-pointer">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
