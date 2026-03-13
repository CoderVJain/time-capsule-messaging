'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  recipient_email: string;
  message: string;
  deliver_at: string;
  status: string;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pastMessages, setPastMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPastMessages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      fetchMessages();
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', text: 'Sealing capsule...' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in to send a message.');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_email: recipient,
          message: message,
          deliver_at: new Date(deliveryDate).toISOString()
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
             handleSignOut();
             router.push('/login');
             return;
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      setStatus({ type: 'success', text: 'Capsule sealed successfully!' });
      setRecipient('');
      setMessage('');
      setDeliveryDate('');
      fetchMessages();
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'Something went wrong.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111] selection:bg-black selection:text-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-xl font-medium tracking-tight">Time Capsule</h1>
          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <button onClick={handleSignOut} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                Sign Out
              </button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <div className="max-w-xl mx-auto space-y-12">
          
          <div className="space-y-4 text-center sm:text-left">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Send a message to the future.</h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              Write a message, choose a date, and we'll deliver it. No gimmicks, just your words preserved.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            {status.text && (
              <div className={`p-4 rounded-xl text-sm ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                {status.text}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Recipient Email</label>
              <input 
                type="email" 
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="future@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#fafafa]"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Message</label>
              <textarea 
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Dear future me..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#fafafa] resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">Delivery Date & Time</label>
              <input 
                type="datetime-local" 
                id="deliveryDate"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#fafafa] text-gray-700"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={status.type === 'loading'}
              className="w-full bg-black text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50"
            >
              Seal Capsule
            </button>
          </form>

        </div>
        </div>

        {isLoggedIn && (
          <div className="mt-24 border-t border-gray-200 pt-16">
            <h3 className="text-3xl font-semibold mb-8 tracking-tight">Your Sealed Capsules</h3>
            {loadingMessages ? (
              <p className="text-gray-500">Loading capsules...</p>
            ) : pastMessages.length === 0 ? (
              <p className="text-gray-500 text-lg">You haven't sealed any capsules yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {pastMessages.map((msg) => (
                  <div key={msg.id} className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full mb-6 ${msg.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                          {msg.status}
                        </span>
                        <p className="text-gray-900 font-medium truncate mb-2 text-lg">To: {msg.recipient_email}</p>
                        <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6">{msg.message}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-500 border-t border-gray-100 pt-6 mt-auto">
                      <p>Deliver at: {new Date(msg.deliver_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
