'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DocumentChat from '@/components/DocumentChat';
import { useTemplateContext } from '@/context/TemplateContext';
import { Template } from '@/types/template';
import { apiFetch } from '@/lib/api';

interface ChatClientProps {
  templateId: string;
}

export default function ChatClient({ templateId }: ChatClientProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { dispatch } = useTemplateContext();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!cancelled) {
          setTemplate(response.ok ? await response.json() : null);
        }
      } catch {
        if (!cancelled) {
          setTemplate(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const handleFieldsExtracted = (extractedFields: Record<string, string>) => {
    setFormFields(prev => ({ ...prev, ...extractedFields }));
    setGenerationError(null);
  };

  const calculateCompletion = (): number => {
    if (!template) return 0;
    const requiredFields = template.customizableFields.filter(f => f.required);
    if (requiredFields.length === 0) return 100;
    const filled = requiredFields.filter(f => formFields[f.name] && formFields[f.name].trim().length > 0).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  const handleGenerate = async () => {
    if (!template) return;
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Validate form fields are strings
      const sanitizedFields: Record<string, string> = {};
      for (const [key, value] of Object.entries(formFields)) {
        const stringValue = String(value || '');
        if (stringValue.length > 10000) {
          throw new Error(`Field "${key}" is too long (${stringValue.length} characters, max 10000)`);
        }
        sanitizedFields[key] = stringValue;
      }

      // Apply customizations to template sections
      const customizedTemplate = JSON.parse(JSON.stringify(template));
      for (const section of customizedTemplate.sections || []) {
        try {
          for (const [fieldName, fieldValue] of Object.entries(sanitizedFields)) {
            const placeholder = `[${fieldName}]`;
            if (section.content && typeof section.content === 'string') {
              // Escape special regex characters in placeholder
              const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              section.content = section.content.replace(new RegExp(escapedPlaceholder, 'g'), fieldValue);
            }
          }
        } catch (sectionError) {
          throw new Error(`Error processing section "${section.title}": ${sectionError instanceof Error ? sectionError.message : String(sectionError)}`);
        }
      }

      // Render full document content
      let documentContent = '';
      try {
        documentContent = (customizedTemplate.sections || [])
          .map((s: any) => `${s.title ? `## ${s.title}\n\n` : ''}${s.content || ''}`)
          .join('\n\n');
      } catch (contentError) {
        throw new Error(`Error rendering document content: ${contentError instanceof Error ? contentError.message : String(contentError)}`);
      }

      // Validate content size
      if (documentContent.length > 100000) {
        throw new Error(`Document content is too large (${documentContent.length} characters, max 100000). Please reduce the field values.`);
      }

      // Generate unique title with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const documentTitle = `${template.name} - ${timestamp}`;

      // Serialize customizations as JSON string
      let customizationsString = '';
      try {
        customizationsString = JSON.stringify(sanitizedFields);
      } catch (stringifyError) {
        throw new Error(`Error serializing fields: ${stringifyError instanceof Error ? stringifyError.message : String(stringifyError)}`);
      }

      console.log('Sending document creation request:', {
        template_id: templateId,
        title: documentTitle,
        content_length: documentContent.length,
        customizations_length: customizationsString.length,
        fields_count: Object.keys(sanitizedFields).length,
      });

      // Validate final payload size
      const finalPayload = JSON.stringify({
        template_id: templateId,
        title: documentTitle,
        content: documentContent,
        customizations: customizationsString,
      });
      if (finalPayload.length > 1000000) {
        throw new Error(`Request payload is too large (${finalPayload.length} bytes, max 1MB). Please reduce the document content.`);
      }

      // Save document with explicit JSON string for customizations
      const saveResponse = await apiFetch('/documents', {
        method: 'POST',
        body: finalPayload,
      });

      if (!saveResponse.ok) {
        let errorMsg = `HTTP ${saveResponse.status}: ${saveResponse.statusText}`;
        try {
          const errorData = await saveResponse.json();
          if (typeof errorData === 'object' && errorData !== null) {
            if ('detail' in errorData) {
              errorMsg = Array.isArray(errorData.detail)
                ? (errorData.detail as any[]).map(e => e.msg || JSON.stringify(e)).join('; ')
                : String(errorData.detail);
            } else {
              errorMsg = JSON.stringify(errorData);
            }
          }
        } catch {
          // Use default error message if JSON parsing fails
        }
        throw new Error(`Failed to save document: ${errorMsg}`);
      }

      let responseData;
      try {
        responseData = await saveResponse.json();
      } catch (parseError) {
        const parseErrorMsg = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
        throw new Error(
          `Failed to parse document response: ${parseErrorMsg}. ` +
          `Response status: ${saveResponse.status}, Content-Type: ${saveResponse.headers.get('content-type')}`
        );
      }

      console.log('Document created successfully:', responseData.id);

      // Dispatch fields to context for preview
      for (const [fieldName, fieldValue] of Object.entries(formFields)) {
        dispatch({
          type: 'SET_FIELD',
          templateId,
          fieldName,
          value: fieldValue as string,
        });
      }

      // Navigate to template viewer
      router.push(`/templates/${templateId}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to generate document:', errorMsg);
      setGenerationError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading template...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-900 font-medium">Template not found</p>
        <Link href="/" className="text-[#209dd7] hover:underline">
          Back to templates
        </Link>
      </div>
    );
  }

  const completion = calculateCompletion();
  const canGenerate = completion === 100;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-[#209dd7] hover:underline text-sm mb-6 inline-block">
          ← Back to templates
        </Link>

        <div className="grid grid-cols-3 gap-8">
          {/* Chat on the left (2 columns) */}
          <div className="col-span-2">
            <DocumentChat
              templateId={templateId}
              templateName={template.name}
              currentFields={formFields}
              onFieldsExtracted={handleFieldsExtracted}
            />
          </div>

          {/* Summary panel on the right */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col h-[800px]">
            <h3 className="text-lg font-bold text-[#032147] mb-4">Progress</h3>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Completion</span>
                <span className="text-sm font-bold text-[#209dd7]">{completion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#209dd7] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {/* Required fields */}
            <div className="flex-1 overflow-y-auto mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Required Fields</h4>
              <div className="space-y-2">
                {template.customizableFields
                  .filter(f => f.required)
                  .map(field => (
                    <div
                      key={field.name}
                      className="text-xs flex items-center gap-2"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formFields[field.name]
                            ? 'bg-[#209dd7] border-[#209dd7]'
                            : 'border-gray-300'
                        }`}
                      >
                        {formFields[field.name] && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span className="text-gray-700">{field.placeholder || field.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Error message */}
            {generationError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg">
                <p className="text-xs text-red-800">
                  <strong>Error:</strong> {generationError}
                </p>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                canGenerate
                  ? 'bg-[#753991] hover:bg-[#5e2e73] cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isGenerating ? 'Generating...' : `Generate ${template.name}`}
            </button>

            {!canGenerate && !isGenerating && (
              <p className="text-xs text-gray-600 text-center mt-2">
                Complete all required fields to enable generation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
