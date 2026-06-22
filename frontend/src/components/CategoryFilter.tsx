'use client';

import { Category } from '@/types/template';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-full px-4 py-2 text-sm font-medium transition-colors',
          selected === null
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onSelect(category.name)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            selected === category.name
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {category.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </button>
      ))}
    </div>
  );
}
