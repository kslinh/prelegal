'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import useSWR from 'swr';
import Link from 'next/link';

interface Document {
  id: number;
  title: string;
  template_id: string;
  created_at: string;
  updated_at: string;
  content: string;
  customizations: string;
}

const fetcher = async (url: string) => {
  const res = await apiFetch(url);
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized - please sign in again');
    }
    throw new Error(`Failed to fetch documents: ${res.status}`);
  }
  return res.json();
};

export default function DocumentsPage() {
  const { isAuthenticated, isLoading: authLoading, session } = useAuth();
  const shouldFetch =
    !authLoading &&
    isAuthenticated &&
    !!session?.access_token;
  const { data: documents = [], mutate, isLoading: dataLoading, error: fetchError } = useSWR<Document[]>(
    shouldFetch ? '/api/documents' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      focusThrottleInterval: 0,
    }
    );
  // Refetch documents when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      mutate();
    }
  }, [isAuthenticated, authLoading, mutate]);

  // Debug logging
  if (typeof window !== 'undefined' && isAuthenticated) {
    console.log('[DocumentsPage]', {
      authenticated: isAuthenticated,
      hasSession: !!session,
      sessionUser: session?.email,
      tokenInStorage: {
        localStorage: !!localStorage.getItem('access_token'),
        sessionStorage: !!sessionStorage.getItem('access_token'),
      },
      swrError: fetchError?.message,
      swrLoading: dataLoading,
    });
  }
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' });
      mutate();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your documents</p>
          <Link href="/auth/login" className="text-[#209dd7] hover:text-[#209dd7]/80 font-medium">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading documents...</div>
      </div>
    );
  }

  if (fetchError) {
    console.error('[DocumentsPage] Fetch error:', fetchError);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-2 font-semibold">Error loading documents</p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4 break-words">{fetchError.message}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => mutate()}
              className="text-[#209dd7] hover:text-[#209dd7]/80 font-medium"
            >
              Try again
            </button>
            <Link href="/" className="text-[#209dd7] hover:text-[#209dd7]/80 font-medium">
              Go back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#032147] dark:text-white mb-2">My Documents</h1>
          <p className="text-[#888888] dark:text-gray-400">
            Manage and download your previously created documents
          </p>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No documents yet</p>
            <Link href="/" className="text-[#209dd7] hover:text-[#209dd7]/80 font-medium">
              Create your first document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#032147] dark:text-white truncate mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-[#888888] dark:text-gray-400">
                    {doc.template_id.toUpperCase()}
                  </p>
                </div>

                <div className="mb-4 text-xs text-[#888888] dark:text-gray-400">
                  <p>Created: {new Date(doc.created_at).toLocaleDateString()}</p>
                  <p>Updated: {new Date(doc.updated_at).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex-1 py-2 px-3 text-sm border border-[#209dd7] text-[#209dd7] hover:bg-[#209dd7]/5 rounded-md font-medium transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(doc.id)}
                    className="flex-1 py-2 px-3 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {deleteConfirm === doc.id && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="flex-1 py-1 px-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-1 px-2 text-xs bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end sm:items-center justify-end">
          <div className="w-full sm:max-w-2xl h-full sm:h-auto sm:rounded-lg bg-white dark:bg-gray-900 shadow-xl flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#032147] dark:text-white">
                {selectedDoc.title}
              </h2>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-light"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                {selectedDoc.content}
              </pre>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const text = selectedDoc.content;
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedDoc.title}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 py-2 px-4 bg-[#209dd7] text-white rounded-lg font-medium hover:bg-[#209dd7]/90 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
