"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import React from 'react';

export default function NewEssay() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // View mode state (input or essay)
  const [viewMode, setViewMode] = useState<'input' | 'essay'>('input');
  
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
          wordCount,
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
      
      // Switch to essay view mode after successful generation
      setViewMode('essay');
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
      return data.essay._id; // Return the essay ID for navigation
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the essay');
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle save and edit
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
        
        {/* Essay view mode - Full width essay with tabs */}
        {viewMode === 'essay' && (
          <div className="flex flex-col">
            {isGenerating ? (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 flex flex-col items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-500">Generating your essay...</p>
                <p className="text-gray-400 text-sm mt-2">This may take up to a minute</p>
              </div>
            ) : (
              <>
                {/* Tab navigation */}
                <div className="bg-white rounded-t-xl border-t border-l border-r border-gray-200 flex justify-between items-center">
                  <nav className="flex">
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
                  
                  {/* Action buttons */}
                  <div className="flex gap-3 pr-4">
                    <button
                      onClick={handleBackToInput}
                      className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-4 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Regenerate
                    </button>
                    
                    {/* Edit button with gray styling and pencil icon (moved to the middle position) */}
                    <button
                      onClick={handleSaveAndEdit}
                      disabled={isSaving}
                      className="flex items-center text-gray-700 hover:text-gray-900 py-2 px-4 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    
                    {/* Save button with gradient styling (moved to the end) */}
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
                
                {/* Essay content or citations */}
                <div className="bg-white rounded-b-xl shadow-sm border-b border-l border-r border-gray-200 p-8 overflow-y-auto h-[calc(100vh-14rem)]">
                  {activeTab === 'content' ? (
                    <div className="prose prose-lg max-w-none">
                      {generatedEssay.split('\n').map((paragraph, i) => {
                        // Skip empty paragraphs
                        if (!paragraph.trim()) return null;
                        
                        // Process headers (# Heading)
                        if (paragraph.trim().startsWith('#')) {
                          const headerMatch = paragraph.trim().match(/^(#{1,5})\s+(.+)$/);
                          if (headerMatch) {
                            const level = headerMatch[1].length;
                            const text = headerMatch[2];
                            
                            // Add appropriate styling based on header level
                            let headerClassNames = "font-bold";
                            
                            switch(level) {
                              case 1:
                                headerClassNames += " text-3xl mb-6 mt-8 text-gray-800 border-b pb-2";
                                break;
                              case 2:
                                headerClassNames += " text-2xl mb-5 mt-7 text-gray-800";
                                break;
                              case 3:
                                headerClassNames += " text-xl mb-4 mt-6 text-gray-700";
                                break;
                              case 4:
                                headerClassNames += " text-lg mb-3 mt-5 text-gray-700";
                                break;
                              case 5:
                                headerClassNames += " text-base mb-2 mt-4 text-gray-600";
                                break;
                            }
                            
                            return React.createElement(
                              `h${level}`,
                              { key: i, className: headerClassNames },
                              text
                            );
                          }
                        }
                        
                        // Format paragraph with markdown elements
                        let formattedText = paragraph;

                        // Format bold text with double asterisks
                        formattedText = formattedText.replace(
                          /\*\*(.*?)\*\*/g, 
                          '<strong>$1</strong>'
                        );

                        // Format bold text with double underscores
                        formattedText = formattedText.replace(
                          /__(.*?)__/g, 
                          '<strong>$1</strong>'
                        );

                        // Format italic text with single asterisks (after handling double)
                        formattedText = formattedText.replace(
                          /\*(.*?)\*/g,
                          '<em>$1</em>'
                        );

                        // Format italic text with single underscores
                        formattedText = formattedText.replace(
                          /_(.*?)_/g,
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}