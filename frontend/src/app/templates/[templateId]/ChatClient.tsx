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

    try {
      // Apply customizations to template sections
      const customizedTemplate = JSON.parse(JSON.stringify(template));
      for (const section of customizedTemplate.sections || []) {
        for (const [fieldName, fieldValue] of Object.entries(formFields)) {
          const placeholder = `[${fieldName}]`;
          if (section.content && typeof section.content === 'string') {
            section.content = section.content.replace(new RegExp(placeholder, 'g'), fieldValue as string);
          }
        }
      }

      // Render full document content
      const documentContent = (customizedTemplate.sections || [])
        .map((s: any) => `${s.title ? `## ${s.title}\n\n` : ''}${s.content || ''}`)
        .join('\n\n');

      // Save document
      const saveResponse = await apiFetch('/documents', {
        method: 'POST',
        body: JSON.stringify({
          template_id: templateId,
          title: `${template.name}`,
          content: documentContent,
          customizations: JSON.stringify(formFields),
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to save document: ${saveResponse.statusText}`);
      }

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
      console.error('Failed to generate document:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate document: ${errorMsg}`);
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
          </div>
        </div>
      </div>
    </div>
  );
}
