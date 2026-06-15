'use client';

import { TemplateIndexEntry } from '@/types/template';
import TemplateCard from './TemplateCard';

interface TemplateGridProps {
  entries: TemplateIndexEntry[];
  isLoading: boolean;
}

export default function TemplateGrid({ entries, isLoading }: TemplateGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
        <p className="text-center text-gray-500">
          No templates found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((entry) => (
        <TemplateCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
