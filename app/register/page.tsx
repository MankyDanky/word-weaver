"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { register, loading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');
    
    // Client-side validation
    if (password !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      await register(email, password);
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed');
    }
  }
  
  return (
    <div className="h-screen min-h-screen w-screen flex flex-col lg:flex-row font-poppins overflow-hidden">
      {/* Register Form Side - Gradient Background */}
      <div className="w-full min-h-screen lg:h-screen lg:w-1/2 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center p-8 relative z-0">
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-800/20 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md space-y-8 bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl relative z-20 border border-white/20">
          <div>
            <h2 className="text-center text-2xl text-white font-bold">WordWeaverAI</h2>
            <h1 className="text-center text-3xl font-bold text-white mt-2">Create your account</h1>
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
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="relative block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-white/30 bg-white/80 backdrop-blur-sm placeholder:text-gray-500 focus:ring-2 focus:ring-white"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-white/90">
                Already have an account? {' '}
                <Link href="/login" className="text-white font-medium hover:text-blue-100 transition-colors">
                  Sign in
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

      {/* Benefits Content Side - White Background */}
      <div className="w-full lg:w-1/2 hidden lg:flex lg:h-screen flex-col items-center justify-center p-8 bg-white z-20 relative">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Join WordWeaverAI Today</h2>
          <p className="text-xl text-gray-600 mb-8">
            Get instant access to powerful AI essay writing tools and save hours on assignments
          </p>
          
          {/* Selling points */}
          <div className="space-y-4 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0 min-w-[2.5rem] w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Save Valuable Time</h3>
                <p className="text-gray-600">Complete essays in minutes instead of hours</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 min-w-[2.5rem] w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Higher Quality Essays</h3>
                <p className="text-gray-600">AI-powered content with proper structure and arguments</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 min-w-[2.5rem] w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">Free Trial Access</h3>
                <p className="text-gray-600">Start using basic features immediately after registration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}