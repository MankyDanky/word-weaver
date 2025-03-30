"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import React from 'react';

function parseMarkdown(content: string): string {
  // Convert headers (#, ##, ###, etc.)
  content = content.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
  content = content.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
  content = content.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Convert bold (** or __)
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Convert italics (* or _)
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
  content = content.replace(/_(.*?)_/g, '<em>$1</em>');

  // Convert line breaks
  content = content.replace(/\n/g, '<br />');

  return content;
}

export default function NewEssay() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // View mode state (input, loading, or essay)
  const [viewMode, setViewMode] = useState<'input' | 'loading' | 'essay'>('input');
  
  // Form state
  const [topic, setTopic] = useState('');
  const [thesis, setThesis] = useState('');
  const [arguments_, setArguments] = useState<string[]>(['']);
  const [wordCount, setWordCount] = useState(1000);
  
  // Essay generation state
  const [generatedEssay, setGeneratedEssay] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes write-1 {
        0% { stroke-dashoffset: 240; }
        16.66% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 0; }
      }

      .scribble-1 {
        stroke-dasharray: 240;
        stroke-dashoffset: 240;
        animation: write-1 12s linear infinite;
      }

      @keyframes write-2 {
        0% { stroke-dashoffset: 240; }
        16.66% { stroke-dashoffset: 240; }
        33.33% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 0; }
      }
      
      .scribble-2 {
        stroke-dasharray: 240;
        stroke-dashoffset: 240;
        animation: write-2 12s linear infinite;
      }

      @keyframes write-3 {
        0% { stroke-dashoffset: 240; }
        33.33% { stroke-dashoffset: 240; }
        50% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 0; }
      }

      .scribble-3 {
        stroke-dasharray: 240;
        stroke-dashoffset: 240;
        animation: write-3 12s linear infinite;
      }

      @keyframes write-4 {
        0% { stroke-dashoffset: 240; }
        50% { stroke-dashoffset: 240; }
        66.66% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 0; }
      }

      .scribble-4 {
        stroke-dasharray: 240;
        stroke-dashoffset: 240;
        animation: write-4 12s linear infinite;
      }

      @keyframes write-5 {
        0% { stroke-dashoffset: 240; }
        66.66% { stroke-dashoffset: 240; } 
        83.33% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 0; }
      }

      .scribble-5 {
        stroke-dasharray: 240;
        stroke-dashoffset: 240;
        animation: write-5 12s linear infinite;
      }

    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Add argument field
  const handleAddArgument = () => {
    setArguments([...arguments_, '']);
  };
  
  // Remove argument field
  const handleRemoveArgument = (index: number) => {
    const newArguments = [...arguments_];
    newArguments.splice(index, 1);
    setArguments(newArguments);
  };
  
  // Update argument value
  const handleArgumentChange = (index: number, value: string) => {
    const newArguments = [...arguments_];
    newArguments[index] = value;
    setArguments(newArguments);
  };
  
  // Enhanced handleGenerate function with improved loading state handling
  const handleGenerate = async () => {
    // Validate form
    if (!topic.trim()) {
      setError('Please provide an essay topic');
      return;
    }
    
    // Filter out empty arguments
    const filteredArguments = arguments_.filter(arg => arg.trim() !== '');
    
    // Set loading state FIRST (before setting isGenerating)
    setViewMode('loading');
    setIsGenerating(true);
    setError(null);
    
    // Record the start time for minimum display duration
    const startTime = Date.now();
    const MIN_LOADING_TIME = 3000; // 3 seconds minimum display time
    
    try {
      // Make the API request
      const response = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          thesis: thesis,
          arguments: filteredArguments,
          wordCount: wordCount,
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate essay');
      }
      
      // Process the response
      const data = await response.json();
      setGeneratedEssay(data.content);
      setCitations(data.citations || []);
      setActiveTab('content');
      
      // Ensure the loading animation is shown for at least MIN_LOADING_TIME
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
      }
      
      // Only then switch to essay view
      setViewMode('essay');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the essay');
      
      // Ensure loading animation shows for minimum time even on error
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
      }
      
      // Go back to input view on error
      setViewMode('input');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Fixed handleSave function
  const handleSave = async () => {
    if (!generatedEssay || isGenerating) {
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          thesis,
          content: generatedEssay,
          arguments: arguments_.filter(arg => arg.trim() !== ''),
          citations,
          wordCount: generatedEssay.split(/\s+/).length,
          status: 'draft'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save essay');
      }
      
      // Read response body ONCE
      const data = await response.json();
      console.log('Essay saved successfully, redirecting to dashboard...');
      
      // Make sure we have essay ID before redirecting
      if (data.essay && data.essay._id) {
        // Force redirect with replace to avoid history issues
        router.push('/dashboard');
        return data.essay._id;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error saving essay:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the essay');
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Keep handleSaveAndEdit as is - it will still redirect to the essay page
  const handleSaveAndEdit = async () => {
    const essayId = await handleSave();
    if (essayId) {
      router.push(`/essay/${essayId}`);
    }
  };
  
  // Back to input form
  const handleBackToInput = () => {
    setViewMode('input');
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-white hover:text-blue-100 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">Create New Essay</h1>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input mode - Full width form */}
        {viewMode === 'input' && (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-8">Essay Parameters</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Topic (required)</label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white transition-colors"
                  placeholder="Enter the essay topic"
                  disabled={isGenerating || isSaving}
                />
              </div>
              
              <div>
                <label htmlFor="thesis" className="block text-sm font-medium text-gray-700 mb-2">Thesis (optional)</label>
                <textarea
                  id="thesis"
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white transition-colors"
                  placeholder="Enter your thesis statement"
                  disabled={isGenerating || isSaving}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Arguments (optional)</label>
                  <button
                    type="button"
                    onClick={handleAddArgument}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    disabled={isGenerating || isSaving}
                  >
                    + Add Argument
                  </button>
                </div>
                <div className="space-y-4">
                  {arguments_.map((arg, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={arg}
                        onChange={(e) => handleArgumentChange(index, e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white transition-colors"
                        placeholder={`Argument ${index + 1}`}
                        disabled={isGenerating || isSaving}
                      />
                      {arguments_.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveArgument(index)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
                          disabled={isGenerating || isSaving}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-2">
                <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Word Count: {wordCount}
                </label>
                <input
                  type="range"
                  id="wordCount"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  min="300"
                  max="3000"
                  step="100"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isGenerating || isSaving}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>300</span>
                  <span>3000</span>
                </div>
              </div>
              
              <div className="pt-6">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className={`w-full py-4 px-4 rounded-md font-medium text-white shadow-sm ${
                    isGenerating || !topic.trim()
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Generating...
                    </div>
                  ) : (
                    generatedEssay ? "Regenerate Essay" : "Generate Essay"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading view with scribble animation */}
        {viewMode === 'loading' && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center">
              {/* Scribble animation */}
              <div className="mb-8 w-48 h-48 relative">
                <svg className="scribble-animation" width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  {/* Paper */}
                  <rect x="40" y="40" width="120" height="140" fill="#f8f8f8" stroke="#e0e0e0" strokeWidth="1" />
                  
                  {/* Scribbles - Ensure correct order */}
                  <path 
                    className="scribble scribble-1" 
                    d="M60,70 Q70,65 80,70 T100,70 T120,70 T140,70" 
                    fill="none" 
                    stroke="#3949AB" 
                    strokeWidth="2"
                  />
                  <path 
                    className="scribble scribble-2" 
                    d="M60,90 Q70,85 80,90 T100,90 T120,90 T140,90" 
                    fill="none" 
                    stroke="#3949AB" 
                    strokeWidth="2"
                  />
                  <path 
                    className="scribble scribble-3" 
                    d="M60,110 Q70,105 80,110 T100,110 T120,110 T140,110" 
                    fill="none" 
                    stroke="#3949AB" 
                    strokeWidth="2"
                  />
                  <path 
                    className="scribble scribble-4" 
                    d="M60,130 Q70,125 80,130 T100,130 T120,130 T140,130" 
                    fill="none" 
                    stroke="#3949AB" 
                    strokeWidth="2"
                  />
                  <path 
                    className="scribble scribble-5" 
                    d="M60,150 Q70,145 80,150 T100,150 T120,150 T140,150" 
                    fill="none" 
                    stroke="#3949AB" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Generating Your Essay</h3>
              <p className="text-gray-600 text-center mb-2">This may take a minute or two...</p>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                Our AI is crafting a thoughtful essay on &#34;{topic}&#34;{thesis ? ` with your thesis: "${thesis}"` : ""}.
              </p>
            </div>
          </div>
        )}
        
        {/* Essay view mode - Full width essay with tabs */}
        {viewMode === 'essay' && (
          <div className="flex flex-col">
            <>
              {/* Tab navigation - Responsive layout */}
              <div className="bg-white rounded-t-xl border-t border-l border-r border-gray-200">
                {/* Top section with tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <nav className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`py-3 px-4 sm:py-4 sm:px-6 text-sm font-medium whitespace-nowrap ${
                        activeTab === 'content'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Essay Content
                    </button>
                    <button
                      onClick={() => setActiveTab('citations')}
                      className={`py-3 px-4 sm:py-4 sm:px-6 text-sm font-medium whitespace-nowrap ${
                        activeTab === 'citations'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Citations ({citations.length})
                    </button>
                  </nav>

                  {/* Word count + buttons on desktop (hidden on mobile) */}
                  <div className="hidden sm:flex items-center space-x-2 sm:px-4">
                    <div className="text-sm text-gray-600 mr-3">
                      Word Count: {generatedEssay.split(/\s+/).length}
                    </div>
                    <button
                      onClick={handleBackToInput}
                      className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-3 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Regenerate
                    </button>
                    <button
                      onClick={handleSaveAndEdit}
                      disabled={isSaving}
                      className="flex items-center text-gray-700 hover:text-gray-900 py-2 px-3 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`py-2 px-4 rounded-md text-sm font-medium text-white ${
                        isSaving
                          ? "bg-indigo-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      }`}
                    >
                      {isSaving ? "Saving..." : "Save Draft"}
                    </button>
                  </div>
                </div>

                {/* Word count + Action buttons for mobile only */}
                <div className="sm:hidden">
                  {/* Word count - mobile only */}
                  <div className="px-4 py-2 text-sm text-gray-600 border-t">
                    Word Count: {generatedEssay.split(/\s+/).length}
                  </div>
                  
                  {/* Action buttons - mobile only */}
                  <div className="flex flex-wrap gap-2 p-3 border-t border-gray-100">
                    <button
                      onClick={handleBackToInput}
                      className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-3 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Regenerate
                    </button>
                    <button
                      onClick={handleSaveAndEdit}
                      disabled={isSaving}
                      className="flex items-center text-gray-700 hover:text-gray-900 py-2 px-3 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`py-2 px-4 rounded-md text-sm font-medium text-white flex-grow ${
                        isSaving
                          ? "bg-indigo-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      }`}
                    >
                      {isSaving ? "Saving..." : "Save Draft"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Essay content or citations */}
              <div className="bg-white rounded-b-xl shadow-sm border-b border-l border-r border-gray-200 p-8 overflow-y-auto h-[calc(100vh-14rem)]">
                {activeTab === 'content' ? (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedEssay) }}
                  ></div>
                ) : (
                  <div className="space-y-4">
                    {citations.length > 0 ? (
                      <>
                        <h3 className="font-medium text-gray-800 mb-3">Sources</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                          {citations.map((citation, index) => (
                            <li key={index}>
                              <a
                                href={citation}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline break-words"
                              >
                                {citation}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">No citations available for this essay.</p>
                    )}
                  </div>
                )}
                <div className="prose prose-lg max-w-none">
                  <style>
                    {`
                      h1 {
                        font-size: 1.875rem; /* Tailwind's text-3xl */
                        font-weight: 700; /* Tailwind's font-bold */
                        margin-bottom: 1rem;
                      }
                      h2 {
                        font-size: 1.5rem; /* Tailwind's text-2xl */
                        font-weight: 700; /* Tailwind's font-bold */
                        margin-bottom: 0.75rem;
                      }
                      h3 {
                        font-size: 1.25rem; /* Tailwind's text-xl */
                        font-weight: 600; /* Tailwind's font-semibold */
                        margin-bottom: 0.5rem;
                      }
                      strong {
                        font-weight: 700; /* Tailwind's font-bold */
                      }
                      em {
                        font-style: italic; /* Tailwind's italic */
                      }
                      p {
                        margin-bottom: 1rem; /* Tailwind's mb-4 */
                        line-height: 1.75; /* Tailwind's leading-relaxed */
                      }
                    `}
                  </style>
                </div>
              </div>
            </>
          </div>
        )}
      </div>
    </div>
  );
}