'use client';

import Link from 'next/link';
import { TemplateIndexEntry } from '@/types/template';
import { getCategoryColor } from '@/lib/utils';
import { useTemplateContext } from '@/context/TemplateContext';

interface TemplateCardProps {
  entry: TemplateIndexEntry;
}

export default function TemplateCard({ entry }: TemplateCardProps) {
  const { state, dispatch } = useTemplateContext();
  const isFavorite = state.favorites.has(entry.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_FAVORITE', id: entry.id });
  };

  return (
    <Link href={`/templates/${entry.id}`}>
      <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-4 flex items-start justify-between">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${getCategoryColor(
              entry.category
            )}`}
          >
            {entry.category
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </span>
          <button
            onClick={handleFavoriteClick}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {entry.name}
        </h3>

        <p className="mb-4 flex-grow text-sm text-gray-600 line-clamp-2">
          {entry.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">v{entry.version}</span>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
