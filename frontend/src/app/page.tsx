'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import TemplateGrid from '@/components/TemplateGrid';
import { TemplateIndexEntry, Category } from '@/types/template';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, isLoading, error } = useSWR(
    '/api/templates',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const templates: TemplateIndexEntry[] = data?.templates || [];
  const categories: Category[] = data?.categories || [];

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Legal Templates
              </h1>
              <p className="text-gray-600">
                Browse and customize templates for your legal documents
              </p>
            </div>
            <Link
              href="/nda/create"
              className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create NDA
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Results */}
        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            Failed to load templates. Please try again later.
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {isLoading
                  ? 'Loading templates...'
                  : `${filteredTemplates.length} template${
                      filteredTemplates.length === 1 ? '' : 's'
                    } found`}
              </p>
            </div>
            <TemplateGrid
              entries={filteredTemplates}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
}
