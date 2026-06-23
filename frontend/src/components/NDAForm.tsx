'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTemplateContext } from '@/context/TemplateContext';
import { apiFetch } from '@/lib/api';
import NDAChat from './NDAChat';

interface NDAFormData {
  templateType: 'nda-001' | 'mnda-001' | 'nda-comprehensive';
  disclosingPartyName: string;
  disclosingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership';
  disclosingPartyAddress: string;
  receivingPartyName: string;
  receivingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership';
  receivingPartyAddress: string;
  effectiveDate: string;
  purpose: string;
  jurisdiction: string;
  termDuration: string;
  terminationNotice: string;
  survivalPeriod: string;
  returnPeriod: string;
  technicalSurvivalPeriod?: string;
}

const EMPTY_FORM: NDAFormData = {
  templateType: 'mnda-001',
  disclosingPartyName: '',
  disclosingPartyType: 'corporation',
  disclosingPartyAddress: '',
  receivingPartyName: '',
  receivingPartyType: 'corporation',
  receivingPartyAddress: '',
  effectiveDate: '',
  purpose: '',
  jurisdiction: 'California',
  termDuration: '2 years',
  terminationNotice: '30 days',
  survivalPeriod: '3 years',
  returnPeriod: '30 days',
};

// Map template field names to form field names
const TEMPLATE_FIELD_MAPPING: Record<string, keyof NDAFormData> = {
  'Purpose': 'purpose',
  'Purpose of Disclosure': 'purpose',
  'Effective Date': 'effectiveDate',
  'MNDA Term': 'termDuration',
  'Agreement Term': 'termDuration',
  'Term of Confidentiality': 'survivalPeriod',
  'Governing Law': 'jurisdiction',
  'Jurisdiction': 'jurisdiction',
  'Disclosing Party': 'disclosingPartyName',
  'Disclosing Party Entity Type': 'disclosingPartyType',
  'Disclosing Party Address': 'disclosingPartyAddress',
  'Receiving Party': 'receivingPartyName',
  'Receiving Party Entity Type': 'receivingPartyType',
  'Receiving Party Address': 'receivingPartyAddress',
  'Termination Notice Period': 'terminationNotice',
  'Return Period': 'returnPeriod',
  'Technical Information Survival Period': 'technicalSurvivalPeriod',
};

const ENTITY_TYPES = [
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC (Limited Liability Company)' },
  { value: 'individual', label: 'Individual' },
  { value: 'partnership', label: 'Partnership' },
];

function entityTypeLabel(type: string): string {
  return ENTITY_TYPES.find(e => e.value === type)?.label || type;
}

const NDA_TYPE_LABELS = {
  'mnda-001': 'Mutual NDA',
  'nda-001': 'NDA',
  'nda-comprehensive': 'Comprehensive NDA',
};

function calculateCompletion(formData: NDAFormData): number {
  const requiredFields = [
    formData.disclosingPartyName,
    formData.receivingPartyName,
    formData.effectiveDate,
    formData.purpose,
    formData.jurisdiction,
  ];
  const filled = requiredFields.filter(f => f && f.length > 0).length;
  return Math.round((filled / requiredFields.length) * 100);
}

export default function NDAForm({ onSubmit }: { onSubmit?: (data: NDAFormData) => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState<NDAFormData>(EMPTY_FORM);
  const [showDetails, setShowDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const { dispatch } = useTemplateContext();

  useEffect(() => {
    const templateId = formData.templateType;
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (response.ok) {
          setTemplate(await response.json());
        }
      } catch (err) {
        console.error('Failed to load template:', err);
      }
    };
    loadTemplate();
  }, [formData.templateType]);

  const handleInputChange = (field: keyof NDAFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateNDA = async () => {
    setIsGenerating(true);
    const templateId = formData.templateType;

    try {
      if (!template) {
        throw new Error('Template not loaded');
      }

      const customizations = {
        'Effective Date': formData.effectiveDate,
        'Purpose': formData.purpose,
        'Purpose of Disclosure': formData.purpose,
        'Disclosing Party': formData.disclosingPartyName,
        'Disclosing Party Entity Type': formData.disclosingPartyType,
        'Disclosing Party Address': formData.disclosingPartyAddress,
        'Receiving Party': formData.receivingPartyName,
        'Receiving Party Entity Type': formData.receivingPartyType,
        'Receiving Party Address': formData.receivingPartyAddress,
        'Jurisdiction': formData.jurisdiction,
        'Governing Law': formData.jurisdiction,
        'Agreement Term': formData.termDuration,
        'MNDA Term': formData.termDuration,
        'Termination Notice Period': formData.terminationNotice,
        'Survival Period': formData.survivalPeriod,
        'Term of Confidentiality': formData.survivalPeriod,
        'Return Period': formData.returnPeriod,
        'Technical Information Survival Period': formData.technicalSurvivalPeriod || '',
      };

      // Apply customizations to template sections
      const customizedTemplate = JSON.parse(JSON.stringify(template));
      for (const section of customizedTemplate.sections || []) {
        for (const [fieldName, fieldValue] of Object.entries(customizations)) {
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
          title: template.name,
          content: documentContent,
          customizations: JSON.stringify(customizations),
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.detail || 'Failed to save document');
      }

      // Dispatch fields to context for preview
      Object.entries(customizations).forEach(([fieldName, value]) => {
        if (value) {
          dispatch({
            type: 'SET_FIELD',
            templateId,
            fieldName,
            value,
          });
        }
      });

      if (onSubmit) {
        onSubmit(formData);
      } else {
        router.push(`/templates/${templateId}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate document';
      console.error('Failed to generate NDA:', err);
      alert(`Error: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const completion = calculateCompletion(formData);
  const isComplete = completion === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-[#209dd7] hover:text-[#1a7fb0] text-sm font-medium">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#032147] mt-2">{NDA_TYPE_LABELS[formData.templateType]} Generator</h1>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#209dd7]">{completion}%</div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section - Left/Main */}
          <div className="lg:col-span-2">
            <NDAChat
              formData={formData}
              onFieldsExtracted={(fields) => {
                Object.entries(fields).forEach(([key, value]) => {
                  if (value) {
                    const formFieldName = TEMPLATE_FIELD_MAPPING[key] || (key.toLowerCase().replace(/\s+/g, '') as keyof NDAFormData);
                    handleInputChange(formFieldName, value);
                  }
                });
              }}
            />
          </div>

          {/* Details Panel - Right */}
          <div className="space-y-4">
            {/* Completion Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Progress</h3>
                <span className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-indigo-600'}`}>
                  {completion}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-green-600' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-left font-semibold text-gray-900 flex items-center justify-between hover:bg-gray-50 p-2 -m-2 rounded"
              >
                <span>Details</span>
                <svg
                  className={`h-5 w-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {showDetails && (
                <div className="mt-4 space-y-4 text-sm">
                  {/* Party 1 */}
                  {formData.disclosingPartyName && (
                    <div className="border-b pb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Disclosing Party</p>
                      <p className="font-medium text-gray-900">{formData.disclosingPartyName}</p>
                      <p className="text-xs text-gray-600">{entityTypeLabel(formData.disclosingPartyType)}</p>
                      {formData.disclosingPartyAddress && (
                        <p className="text-xs text-gray-600 mt-1">{formData.disclosingPartyAddress}</p>
                      )}
                    </div>
                  )}

                  {/* Party 2 */}
                  {formData.receivingPartyName && (
                    <div className="border-b pb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Receiving Party</p>
                      <p className="font-medium text-gray-900">{formData.receivingPartyName}</p>
                      <p className="text-xs text-gray-600">{entityTypeLabel(formData.receivingPartyType)}</p>
                      {formData.receivingPartyAddress && (
                        <p className="text-xs text-gray-600 mt-1">{formData.receivingPartyAddress}</p>
                      )}
                    </div>
                  )}

                  {/* Terms */}
                  {(formData.effectiveDate || formData.purpose || formData.jurisdiction) && (
                    <div className="border-b pb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Terms</p>
                      <div className="space-y-2">
                        {formData.effectiveDate && (
                          <div>
                            <p className="text-xs text-gray-600">Effective Date</p>
                            <p className="font-medium text-gray-900">{new Date(formData.effectiveDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {formData.purpose && (
                          <div>
                            <p className="text-xs text-gray-600">Purpose</p>
                            <p className="font-medium text-gray-900 line-clamp-2">{formData.purpose}</p>
                          </div>
                        )}
                        {formData.jurisdiction && (
                          <div>
                            <p className="text-xs text-gray-600">Jurisdiction</p>
                            <p className="font-medium text-gray-900">{formData.jurisdiction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Durations */}
                  {(formData.termDuration || formData.survivalPeriod) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Durations</p>
                      <div className="space-y-1 text-xs">
                        {formData.termDuration && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Term:</span>
                            <span className="font-medium text-gray-900">{formData.termDuration}</span>
                          </div>
                        )}
                        {formData.terminationNotice && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Notice:</span>
                            <span className="font-medium text-gray-900">{formData.terminationNotice}</span>
                          </div>
                        )}
                        {formData.survivalPeriod && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Survival:</span>
                            <span className="font-medium text-gray-900">{formData.survivalPeriod}</span>
                          </div>
                        )}
                        {formData.returnPeriod && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Return:</span>
                            <span className="font-medium text-gray-900">{formData.returnPeriod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>💡 Tip:</strong> Chat naturally about your NDA needs. The AI will extract all the details and fill in your agreement automatically.
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateNDA}
              disabled={!isComplete || isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${
                isComplete
                  ? 'bg-[#753991] hover:bg-[#5e2e73]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Generate {NDA_TYPE_LABELS[formData.templateType]}
                </>
              )}
            </button>

            {!isComplete && (
              <p className="text-xs text-gray-600 text-center">
                Complete all fields by chatting to enable generation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
