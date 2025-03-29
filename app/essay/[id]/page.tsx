"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

// Essay type definition from your existing code
interface Essay {
  _id: string;
  topic: string;
  thesis: string;
  content: string;
  status: 'draft' | 'in-progress' | 'complete';
  wordCount: number;
  citations: string[];
  created_at: string;
  updated_at: string;
}

export default function EssayEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [activeEditorTab, setActiveEditorTab] = useState<'edit' | 'preview' | 'citations'>('edit');
  const [isAppendingWorksCited, setIsAppendingWorksCited] = useState(false);
  const [citationStyle, setCitationStyle] = useState('MLA'); // Default to MLA
  const previewBottomRef = useRef<HTMLDivElement | null>(null);
  
  // Fetch essay data
  useEffect(() => {
    async function fetchEssay() {
      try {
        const response = await fetch(`/api/essay/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch essay');
        }
        const data = await response.json();
        setEssay(data.essay);
        setEditedContent(data.essay.content || '');
        calculateWordCount(data.essay.content || '');
      } catch (err) {
        setError('Error loading essay');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && params.id) {
      fetchEssay();
    }
  }, [isAuthenticated, params.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Calculate word count
  const calculateWordCount = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  };

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    calculateWordCount(newContent);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      addFormatting('bold');
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      addFormatting('italic');
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Save essay
  const handleSave = async (newStatus?: Essay['status']) => {
    if (!essay) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/essay/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
          wordCount,
          status: newStatus || essay.status
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save essay');
      }
      
      const data = await response.json();
      setEssay(data.essay);
      // Show success message or notification here
    } catch (err) {
      console.error(err);
      setError('Error saving essay');
    } finally {
      setIsSaving(false);
    }
  };


  // Handle status change
  const handleStatusChange = (newStatus: Essay['status']) => {
    if (newStatus === essay?.status || isSaving) return;
    
    // Show visual feedback immediately
    setEssay(prev => prev ? {...prev, status: newStatus} : null);
    
    // Save the change to the server
    handleSave(newStatus);
  };

  // Format Markdown to HTML
  const formatMarkdown = (content: string) => {
    if (!content) return '';

    let formattedContent = content;

    // Handle headers
    formattedContent = formattedContent.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="text-${level === 1 ? '3xl' : level === 2 ? '2xl' : level === 3 ? 'xl' : 'lg'} font-bold my-4">${text}</h${level}>`;
    });

    // Handle bold text with ** or __
    formattedContent = formattedContent.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    // Handle italic text with * or _
    formattedContent = formattedContent.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // Handle paragraphs (simple approach)
    formattedContent = formattedContent
      .split('\n')
      .map((para) => {
        // Skip if it's already a header or empty
        if (para.trim().startsWith('<h') || !para.trim()) return para;
        return `<p class="mb-4">${para}</p>`;
      })
      .join('');

    return formattedContent;
  };

  // Add formatting to selected text
  const addFormatting = (format: string) => {
    const textarea = document.getElementById('essay-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || ''}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || ''}*`;
        break;
    }

    const newContent = editedContent.substring(0, start) + formattedText + editedContent.substring(end);
    setEditedContent(newContent);

    // Set the cursor position inside the formatting
    const cursorPosition = start + (format === 'bold' ? 2 : 1); // Place cursor after the opening `**` or `*`
    setTimeout(() => {
      textarea.setSelectionRange(cursorPosition, cursorPosition);
      textarea.focus();
    }, 0);
  };

  const handleAppendWorksCited = async () => {
    if (!essay?.citations || essay.citations.length === 0) {
      setError('No citations available to generate works cited.');
      return;
    }

    setIsAppendingWorksCited(true); // Set loading state to true

    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citations: essay.citations, style: citationStyle }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate works cited');
      }

      const data = await response.json();

      if (data.worksCited) {
        // Append the works cited to the essay content
        const updatedContent = `${editedContent}\n\n${data.worksCited}`;
        setEditedContent(updatedContent);
        calculateWordCount(updatedContent);

        // Switch to the preview tab
        setActiveEditorTab('preview');

        // Scroll to the bottom of the preview page
        setTimeout(() => {
          previewBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 5);
      }
    } catch (err) {
      console.error(err);
      setError('Error appending works cited.');
    } finally {
      setIsAppendingWorksCited(false); // Set loading state to false
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
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
              <h1 className="text-2xl font-bold">Edit Essay</h1>
            </div>

            {/* Save button in header */}
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className={`py-2 px-4 rounded-md text-sm font-medium text-white transition-colors ${
                isSaving
                  ? "bg-white/20 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/20 border border-white/20"
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : essay ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-8">
                <h2 className="font-semibold text-lg text-gray-800 mb-4">Essay Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Topic</h3>
                    <p className="text-gray-800">{essay.topic}</p>
                  </div>
                  
                  {essay.thesis && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Thesis</h3>
                      <p className="text-gray-800">{essay.thesis}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p className="text-gray-800">{formatDate(essay.created_at)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Words</h3>
                    <p className="text-gray-800">{wordCount} words</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      {isSaving && (
                        <div className="inline-block h-4 w-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Status toggle buttons */}
                      <button
                        onClick={() => handleStatusChange('draft')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          essay.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Draft
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange('in-progress')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          essay.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        In Progress
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange('complete')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          essay.status === 'complete'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Formatting</h3>
                    <div className="flex flex-wrap gap-2">
                      {/* Bold button */}
                      <button
                        onClick={() => addFormatting('bold')}
                        className="w-9 h-9 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                        title="Bold"
                      >
                        <span className="font-bold text-lg">B</span>
                      </button>

                      {/* Italic button */}
                      <button
                        onClick={() => addFormatting('italic')}
                        className="w-9 h-9 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                        title="Italic"
                      >
                        <span className="italic text-lg">I</span>
                      </button>

                      {/* Heading 1 button */}
                      <button
                        onClick={() => addFormatting('h1')}
                        className="w-9 h-9 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                        title="Heading 1"
                      >
                        <span className="font-bold">H1</span>
                      </button>

                      {/* Heading 2 button */}
                      <button
                        onClick={() => addFormatting('h2')}
                        className="w-9 h-9 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                        title="Heading 2"
                      >
                        <span className="font-bold text-sm">H2</span>
                      </button>

                      {/* Heading 3 button */}
                      <button
                        onClick={() => addFormatting('h3')}
                        className="w-9 h-9 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                        title="Heading 3"
                      >
                        <span className="font-bold text-xs">H3</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Editor area */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Editor tabs */}
                <div className="border-b border-gray-200 flex">
                  <button
                    onClick={() => setActiveEditorTab('edit')}
                    className={`py-3 px-6 text-sm font-medium ${
                      activeEditorTab === 'edit'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setActiveEditorTab('preview')}
                    className={`py-3 px-6 text-sm font-medium ${
                      activeEditorTab === 'preview'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveEditorTab('citations')}
                    className={`py-3 px-6 text-sm font-medium ${
                      activeEditorTab === 'citations'
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Citations {essay?.citations?.length > 0 && `(${essay.citations.length})`}
                  </button>
                </div>
                
                {/* Content area - editor */}
                <div className="p-6">
                  {activeEditorTab === 'edit' && (
                    <textarea
                      id="essay-editor"
                      value={editedContent}
                      onChange={handleContentChange}
                      onKeyDown={handleKeyDown}
                      className="w-full h-[calc(100vh-16rem)] rounded-md border border-gray-300 p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Start writing your essay here..."
                    ></textarea>
                  )}

                  {/* Preview tab content */}
                  {activeEditorTab === 'preview' && (
                    <div className="p-6">
                      <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(editedContent) }}
                      ></div>
                      {/* Reference for scrolling to the bottom */}
                      <div ref={previewBottomRef}></div>
                    </div>
                  )}

                  {/* Citations tab content */}
                  {activeEditorTab === 'citations' && (
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Citations</h2>
                      {essay?.citations?.length > 0 ? (
                        <>
                          <ul className="list-disc pl-5 space-y-2">
                            {essay.citations.map((citation, index) => (
                              <li key={index} className="text-gray-600">
                                <a
                                  href={citation}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline break-words"
                                >
                                  {citation}
                                </a>
                              </li>
                            ))}
                          </ul>

                          {/* Dropdown for citation style */}
                          <div className="mt-6">
                            <label htmlFor="citation-style" className="block text-sm font-medium text-gray-700 mb-2">
                              Citation Style
                            </label>
                            <select
                              id="citation-style"
                              value={citationStyle}
                              onChange={(e) => setCitationStyle(e.target.value)}
                              className="mt-1 block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                            >
                              <option value="MLA">MLA</option>
                              <option value="APA">APA</option>
                              <option value="Chicago">Chicago</option>
                            </select>
                          </div>

                          {/* Append Works Cited Button */}
                          <button
                            onClick={handleAppendWorksCited}
                            disabled={isAppendingWorksCited}
                            className={`mt-6 inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-5 rounded-lg font-medium shadow-md transition-all text-sm ${
                              isAppendingWorksCited ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isAppendingWorksCited ? (
                              <div className="flex items-center">
                                <svg
                                  className="animate-spin h-4 w-4 mr-2 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  ></path>
                                </svg>
                                Appending...
                              </div>
                            ) : (
                              'Append Works Cited'
                            )}
                          </button>
                        </>
                      ) : (
                        <p className="text-gray-500 italic">No citations available for this essay.</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Word count footer */}
                <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                  <div>{wordCount} words</div>
                  <button
                    onClick={() => handleSave()}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">Essay not found</p>
          </div>
        )}
      </div>
    </div>
  );
}