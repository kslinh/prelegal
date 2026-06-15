'use client';

import Link from 'next/link';
import { Template } from '@/types/template';
import { useTemplateContext } from '@/context/TemplateContext';
import { applyCustomizations, downloadFile, getCategoryColor, exportAsText } from '@/lib/utils';

interface TemplateViewerProps {
  template: Template;
}

export default function TemplateViewer({ template }: TemplateViewerProps) {
  const { state, dispatch } = useTemplateContext();
  const isFavorite = state.favorites.has(template.id);
  const customizations = state.customizations[template.id] || {};

  const handleFavoriteClick = () => {
    dispatch({ type: 'TOGGLE_FAVORITE', id: template.id });
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(template, null, 2);
    downloadFile(json, `${template.id}.json`, 'application/json');
  };

  const handleDownloadText = () => {
    const text = exportAsText(template);
    downloadFile(text, `${template.id}.txt`, 'text/plain');
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    dispatch({
      type: 'SET_FIELD',
      templateId: template.id,
      fieldName,
      value,
    });
  };

  const handleResetFields = () => {
    dispatch({ type: 'RESET_FIELDS', templateId: template.id });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← Back to Templates
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleFavoriteClick}
              className="rounded-full p-2 hover:bg-gray-200 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`h-6 w-6 ${
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
        </div>

        {/* Title and Category */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${getCategoryColor(
                template.category
              )}`}
            >
              {template.category
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </span>
            <span className="text-sm text-gray-500">v{template.version}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {template.name}
          </h1>
          <p className="text-gray-600">{template.description}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {template.sections.map((section) => (
                <div
                  key={section.id}
                  className={`border-b border-gray-200 p-6 last:border-b-0 ${
                    section.modifiable ? '' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    {!section.modifiable && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Read-only</span>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {applyCustomizations(section.content, customizations)}
                  </div>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download JSON
              </button>
              <button
                onClick={handleDownloadText}
                className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white font-medium hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Text
              </button>
            </div>
          </div>

          {/* Right Column - Customization Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Customize
              </h3>

              {template.customizableFields.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No customizable fields
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {template.customizableFields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.name}
                          {field.required && (
                            <span className="text-red-600 ml-1">*</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={customizations[field.name] || ''}
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                          }
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  {Object.keys(customizations).length > 0 && (
                    <button
                      onClick={handleResetFields}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Reset Fields
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
