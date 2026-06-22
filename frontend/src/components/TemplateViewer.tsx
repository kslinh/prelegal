'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Template } from '@/types/template';
import { useTemplateContext } from '@/context/TemplateContext';
import { applyCustomizations, downloadFile, getCategoryColor, downloadPdf } from '@/lib/utils';

interface TemplateViewerProps {
  template: Template;
}

export default function TemplateViewer({ template }: TemplateViewerProps) {
  const { state, dispatch } = useTemplateContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedSections, setEditedSections] = useState<Record<string, string>>({});

  // Initialize editedSections from draft if it exists (when not in edit mode)
  useEffect(() => {
    if (!isEditMode) {
      const draft = state.drafts[template.id];
      if (draft) {
        setEditedSections(draft.sections);
      } else {
        setEditedSections({});
      }
    }
  }, [template.id, state.drafts, isEditMode]);

  const isFavorite = state.favorites.has(template.id);
  const customizations = state.customizations[template.id] || {};
  const hasDraft = state.drafts[template.id] !== undefined;

  // Memoize section content to ensure preview updates when customizations change
  const sectionContent = useMemo(() => {
    const content: Record<string, string> = {};
    template.sections.forEach(section => {
      content[section.id] = editedSections[section.id] || applyCustomizations(section.content, customizations);
    });
    return content;
  }, [template.sections, editedSections, customizations]);

  const handleFavoriteClick = () => {
    dispatch({ type: 'TOGGLE_FAVORITE', id: template.id });
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(template, null, 2);
    downloadFile(json, `${template.id}.json`, 'application/json');
  };

  const handleDownloadPdf = async () => {
    const sections = template.sections.map((section) => ({
      title: section.title,
      content: sectionContent[section.id],
    }));
    try {
      await downloadPdf(template.name, template.description, sections, `${template.id}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Sorry, the PDF could not be generated. Please try again.');
    }
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

  const handleEditSection = (sectionId: string, content: string) => {
    setEditedSections({ ...editedSections, [sectionId]: content });
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Reset edits when exiting edit mode without saving
      setEditedSections({});
    } else {
      // Initialize edited sections - use draft if available, otherwise use current content with customizations
      const draft = state.drafts[template.id];
      if (draft) {
        setEditedSections(draft.sections);
      } else {
        const initial: Record<string, string> = {};
        template.sections.forEach(section => {
          initial[section.id] = applyCustomizations(section.content, customizations);
        });
        setEditedSections(initial);
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveDraft = () => {
    dispatch({
      type: 'SAVE_DRAFT',
      templateId: template.id,
      sections: editedSections,
      customizations,
    });
    setIsEditMode(false);
  };

  const handleDeleteDraft = () => {
    dispatch({ type: 'DELETE_DRAFT', templateId: template.id });
  };

  const handleRestoreDraft = () => {
    const draft = state.drafts[template.id];
    if (draft) {
      dispatch({ type: 'RESTORE_DRAFT', draft });
    }
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
            {hasDraft && !isEditMode && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 px-3 py-2 rounded-lg">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Unsaved Draft</span>
              </div>
            )}
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Draft
                </button>
                <button
                  onClick={handleToggleEditMode}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleToggleEditMode}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
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
            {hasDraft && !isEditMode && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">You have unsaved changes</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Last saved: {new Date(state.drafts[template.id].savedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRestoreDraft}
                    className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={handleDeleteDraft}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow">
              {template.sections.map((section) => (
                <div
                  key={section.id}
                  className={`border-b border-gray-200 p-6 last:border-b-0 ${
                    (section.modifiable && isEditMode) ? 'bg-blue-50' : section.modifiable ? '' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    <div className="flex items-center gap-2">
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
                      {isEditMode && section.modifiable && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a1 1 0 110 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Editable
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditMode && section.modifiable ? (
                    <textarea
                      value={editedSections[section.id] || ''}
                      onChange={(e) => handleEditSection(section.id, e.target.value)}
                      className="w-full h-40 rounded-lg border border-blue-400 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap font-mono"
                    />
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {sectionContent[section.id]}
                    </div>
                  )}
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
                onClick={handleDownloadPdf}
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
                Download PDF
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
                        {field.type === 'select' && field.options ? (
                          <select
                            value={customizations[field.name] || ''}
                            onChange={(e) =>
                              handleFieldChange(field.name, e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={customizations[field.name] || ''}
                            onChange={(e) =>
                              handleFieldChange(field.name, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
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
