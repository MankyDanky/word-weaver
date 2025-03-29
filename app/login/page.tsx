"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { login, loading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/dashboard';
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');
    
    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  }
  
  return (
    <div className="h-screen min-h-screen w-screen flex flex-col lg:flex-row font-poppins overflow-hidden">
      {/* Login Form Side - Gradient Background */}
      <div className="w-full min-h-screen lg:h-screen lg:w-1/2 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center p-8 relative z-0">
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-800/20 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md space-y-8 bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl relative z-20 border border-white/20">
          <div>
            <h2 className="text-center text-2xl text-white font-bold">WordWeaverAI</h2>
            <h1 className="text-center text-3xl font-bold text-white mt-2">Sign in to your account</h1>
          </div>
          
          {(error || localError) && (
            <div className="bg-red-100/90 backdrop-blur-sm border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || localError}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-white/30 bg-white/80 backdrop-blur-sm placeholder:text-gray-500 focus:ring-2 focus:ring-white"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-white/30 bg-white/80 backdrop-blur-sm placeholder:text-gray-500 focus:ring-2 focus:ring-white"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative flex w-full justify-center rounded-md px-3 py-3 text-sm font-semibold ${
                  loading 
                    ? 'bg-white/50 text-indigo-800 cursor-not-allowed' 
                    : 'bg-white text-indigo-600 hover:bg-blue-50 hover:text-indigo-700'
                } transition-all duration-200 shadow-md`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-white/90">
                Don&#39;t have an account? {' '}
                <Link href="/register" className="text-white font-medium hover:text-blue-100 transition-colors">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Divider SVG - Only visible on desktop */}
      <div className="hidden lg:block absolute top-0 left-1/2 h-screen w-24 z-10" style={{ transform: 'translateX(-50%)' }}>
        <svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="white">
          <path d="M50,0 L100,0 L100,100 L50,100 Q30,50 50,0" />
        </svg>
      </div>

      {/* Welcome Content Side - White Background */}
      <div className="w-full lg:w-1/2 hidden lg:flex lg:h-screen flex-col items-center justify-center p-8 bg-white z-20 relative">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome Back</h2>
          <p className="text-xl text-gray-600 mb-8">
            Ready to craft your next perfect essay with AI assistance?
          </p>
          
          {/* Feature highlights */}
          <div className="space-y-4 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Smart Essay Generation</h3>
                <p className="text-gray-600">Create well-structured essays in minutes</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Custom Themes & Styles</h3>
                <p className="text-gray-600">Tailor essays to your specific requirements</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Academic Citations</h3>
                <p className="text-gray-600">Automatically include proper references</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}