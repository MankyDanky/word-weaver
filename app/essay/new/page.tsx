"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import React from 'react';

export default function NewEssay() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
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
  
  // Handle essay generation
  const handleGenerate = async () => {
    // Validate form
    if (!topic.trim()) {
      setError('Please provide an essay topic');
      return;
    }
    
    // Filter out empty arguments
    const filteredArguments = arguments_.filter(arg => arg.trim() !== '');
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          thesis,
          arguments: filteredArguments,
          wordCount
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate essay');
      }
      
      const data = await response.json();
      setGeneratedEssay(data.content);
      setCitations(data.citations || []);
      setActiveTab('content');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the essay');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle essay saving
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
        const data = await response.json();
        throw new Error(data.error || 'Failed to save essay');
      }
      
      const data = await response.json();
      router.push(`/essay/${data.essay._id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the essay');
    } finally {
      setIsSaving(false);
    }
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section - Updated with fixed height and scrolling */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 h-[40rem] overflow-y-auto">
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
                {!generatedEssay ? (
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
                      "Generate Essay"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full py-4 px-4 rounded-md font-medium text-white shadow-sm ${
                      isSaving
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    }`}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Essay"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Essay Display Section */}
          <div className={`${generatedEssay || isGenerating ? "block" : "hidden"} lg:block bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full`}>
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'content'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Essay Content
                </button>
                <button
                  onClick={() => setActiveTab('citations')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'citations'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Citations ({citations.length})
                </button>
              </nav>
            </div>
            
            {/* Essay Display Section - Content tab with proper formatting */}
            <div className="flex-1 p-6 overflow-y-auto h-[36rem]">
              {isGenerating && !generatedEssay ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-500">Generating your essay...</p>
                  <p className="text-gray-400 text-sm mt-2">This may take up to a minute</p>
                </div>
              ) : activeTab === 'content' ? (
                generatedEssay ? (
                  <div className="prose prose-lg w-full max-w-full">
                    {generatedEssay.split('\n').map((paragraph, i) => {
                      // Skip empty paragraphs
                      if (!paragraph.trim()) return null;
                      
                      // Process headers (# Heading) - must be at start of line
                      if (paragraph.trim().startsWith('#')) {
                        const headerMatch = paragraph.trim().match(/^(#{1,5})\s+(.+)$/);
                        if (headerMatch) {
                          const level = headerMatch[1].length;
                          const text = headerMatch[2];
                          
                          return React.createElement(
                            `h${level}`,
                            { key: i, className: "mt-6 mb-4" },
                            text
                          );
                        }
                      }
                      
                      // Format paragraph with multiple markdown elements
                      let formattedText = paragraph;
                      
                      // Format bold text
                      formattedText = formattedText.replace(
                        /\*\*(.*?)\*\*/g, 
                        '<strong>$1</strong>'
                      );
                      
                      // Format italic text
                      formattedText = formattedText.replace(
                        /\*(.*?)\*/g,
                        '<em>$1</em>'
                      );
                      
                      return (
                        <p 
                          key={i} 
                          className="mb-4" 
                          dangerouslySetInnerHTML={{ __html: formattedText }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Ready to Generate</h3>
                    <p className="text-gray-500 mt-2">Fill in the parameters and click &#34;Generate Essay&#34;</p>
                  </div>
                )
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}