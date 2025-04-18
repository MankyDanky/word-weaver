"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Essay type definition
interface Essay {
  _id: string;
  topic: string;
  thesis: string;
  content: string;
  status: 'draft' | 'in-progress' | 'complete';
  wordCount: number;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch essays when component mounts
  useEffect(() => {
    async function fetchEssays() {
      try {
        const response = await fetch('/api/essays');
        if (!response.ok) {
          throw new Error('Failed to fetch essays');
        }
        const data = await response.json();
        setEssays(data.essays);
      } catch (err) {
        setError('Error loading essays');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchEssays();
    }
  }, [isAuthenticated]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);
  
  // Delete essay handler
  const handleDeleteEssay = async (id: string) => {
    if (!confirm('Are you sure you want to delete this essay?')) return;
    
    try {
      const response = await fetch(`/api/essay/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete essay');
      }
      
      // Remove deleted essay from state
      setEssays(essays.filter(essay => essay._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting essay');
    }
  };
  
  // Handle loading state
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Status badge component with improved styling to prevent text wrapping
  const StatusBadge = ({ status }: { status: Essay['status'] }) => {
    let colorClass = '';
    switch (status) {
      case 'draft':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'in-progress':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'complete':
        colorClass = 'bg-green-100 text-green-800';
        break;
    }
    
    // Determine proper display text and adjust styling accordingly
    const displayText = status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <span className={`text-xs font-medium px-3 py-0.5 rounded-full whitespace-nowrap min-w-[90px] text-center inline-flex items-center justify-center ${colorClass}`}>
        {displayText}
      </span>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Responsive header with gradient background */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold">WordWeaverAI</h1>
              <p className="text-blue-100">Your AI Essay Assistant</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="text-left sm:text-right">
                <p className="text-sm text-blue-100">Signed in as</p>
                <p className="font-medium truncate max-w-[200px]">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white py-1.5 sm:py-2 px-4 rounded-lg font-medium border border-white/20 transition-colors w-full sm:w-auto"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content with responsive padding */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 space-y-3 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Essays</h2>
          
          {/* Only show the New Essay button if there are essays */}
          {essays.length > 0 && (
            <Link 
              href="/essay/new" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 sm:px-5 rounded-lg font-medium shadow-md transition-all text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Essay
            </Link>
          )}
        </div>
        
        {/* Loading and error states */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : essays.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-8 text-center">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">No essays yet</h3>
            <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Get started by creating your first AI-powered essay</p>
            <Link href="/essay/new" className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-5 rounded-lg font-medium shadow-md transition-all text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Essay
            </Link>
          </div>
        ) : (
          /* Responsive essay grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {essays.map((essay) => (
              <div key={essay._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{essay.topic}</h3>
                    <StatusBadge status={essay.status} />
                  </div>
                  
                  {essay.thesis && (
                    <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2">{essay.thesis}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <span>{formatDate(essay.created_at)}</span>
                    <span>{essay.wordCount} words</span>
                  </div>
                  
                  <div className="border-t border-gray-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 flex justify-between mt-auto">
                    <Link href={`/essay/${essay._id}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm">
                      View & Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteEssay(essay._id)} 
                      className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}