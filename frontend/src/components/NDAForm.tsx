'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTemplateContext } from '@/context/TemplateContext';

interface NDAFormData {
  // Template Selection
  templateType: 'nda' | 'mnda' | 'nda-comprehensive';

  // Disclosing Party
  disclosingPartyName: string;
  disclosingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership';
  disclosingPartyAddress: string;

  // Receiving Party
  receivingPartyName: string;
  receivingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership';
  receivingPartyAddress: string;

  // Agreement Details
  effectiveDate: string;
  purpose: string;
  jurisdiction: string;

  // Terms
  termDuration: string;
  terminationNotice: string;
  survivalPeriod: string;
  returnPeriod: string;

  // Additional (for comprehensive NDA)
  technicalSurvivalPeriod?: string;
}

const EMPTY_FORM: NDAFormData = {
  templateType: 'nda-comprehensive',
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

const JURISDICTIONS = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
  'United Kingdom (English Law)', 'Canada', 'Australia', 'India',
  'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'UAE (Dubai)',
  'New Zealand', 'Ireland', 'Mexico', 'Brazil',
];

const ENTITY_TYPES = [
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC (Limited Liability Company)' },
  { value: 'individual', label: 'Individual' },
  { value: 'partnership', label: 'Partnership' },
];

const TEMPLATE_OPTIONS = [
  { value: 'nda', label: 'Standard NDA (One-Way)' },
  { value: 'mnda', label: 'Mutual NDA (Two-Way)' },
  { value: 'nda-comprehensive', label: 'Comprehensive NDA (Advanced)' },
];

export default function NDAForm({ onSubmit }: { onSubmit?: (data: NDAFormData) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<NDAFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { dispatch } = useTemplateContext();

  const handleInputChange = (field: keyof NDAFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.templateType) newErrors.templateType = 'Please select a template type';
    }

    if (stepNum === 2) {
      if (!formData.disclosingPartyName) newErrors.disclosingPartyName = 'Required';
      if (!formData.disclosingPartyAddress) newErrors.disclosingPartyAddress = 'Required';
      if (!formData.receivingPartyName) newErrors.receivingPartyName = 'Required';
      if (!formData.receivingPartyAddress) newErrors.receivingPartyAddress = 'Required';
    }

    if (stepNum === 3) {
      if (!formData.effectiveDate) newErrors.effectiveDate = 'Required';
      if (!formData.purpose) newErrors.purpose = 'Required';
      if (!formData.jurisdiction) newErrors.jurisdiction = 'Required';
    }

    if (stepNum === 4) {
      if (!formData.termDuration) newErrors.termDuration = 'Required';
      if (!formData.terminationNotice) newErrors.terminationNotice = 'Required';
      if (!formData.survivalPeriod) newErrors.survivalPeriod = 'Required';
      if (!formData.returnPeriod) newErrors.returnPeriod = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      // Populate template context with form data
      const templateId = formData.templateType;

      // Map form data to template field names
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

      // Dispatch to context
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

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(formData);
      } else {
        // Redirect to template viewer
        window.location.href = `/templates/${templateId}`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">NDA Generator</h1>
          <p className="text-gray-600 mt-2">Create a customized Non-Disclosure Agreement in 4 easy steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                    step === stepNum
                      ? 'bg-indigo-600 text-white'
                      : step > stepNum
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > stepNum ? '✓' : stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      step > stepNum ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Template</span>
            <span>Parties</span>
            <span>Details</span>
            <span>Terms</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Choose NDA Type</h2>
              <div className="space-y-4">
                {TEMPLATE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-indigo-50" style={{
                    borderColor: formData.templateType === option.value ? '#4F46E5' : '#E5E7EB'
                  }}>
                    <input
                      type="radio"
                      name="template"
                      value={option.value}
                      checked={formData.templateType === option.value}
                      onChange={(e) => handleInputChange('templateType', e.target.value as any)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.value === 'nda' && 'Standard one-way NDA for protecting your confidential information'}
                        {option.value === 'mnda' && 'Mutual NDA for two-way confidentiality obligations'}
                        {option.value === 'nda-comprehensive' && 'Advanced NDA with comprehensive provisions for complex agreements'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Party Information */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Party Information</h2>
              <div className="space-y-6">
                {/* Disclosing Party */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Disclosing Party (You)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company/Individual Name *
                      </label>
                      <input
                        type="text"
                        value={formData.disclosingPartyName}
                        onChange={(e) => handleInputChange('disclosingPartyName', e.target.value)}
                        placeholder="Enter your company or name"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.disclosingPartyName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.disclosingPartyName && (
                        <p className="text-red-600 text-sm mt-1">{errors.disclosingPartyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entity Type *
                      </label>
                      <select
                        value={formData.disclosingPartyType}
                        onChange={(e) => handleInputChange('disclosingPartyType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {ENTITY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        value={formData.disclosingPartyAddress}
                        onChange={(e) => handleInputChange('disclosingPartyAddress', e.target.value)}
                        placeholder="Street address, city, state, zip"
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.disclosingPartyAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.disclosingPartyAddress && (
                        <p className="text-red-600 text-sm mt-1">{errors.disclosingPartyAddress}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Receiving Party */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Receiving Party (Counterparty)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company/Individual Name *
                      </label>
                      <input
                        type="text"
                        value={formData.receivingPartyName}
                        onChange={(e) => handleInputChange('receivingPartyName', e.target.value)}
                        placeholder="Enter counterparty's company or name"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.receivingPartyName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.receivingPartyName && (
                        <p className="text-red-600 text-sm mt-1">{errors.receivingPartyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entity Type *
                      </label>
                      <select
                        value={formData.receivingPartyType}
                        onChange={(e) => handleInputChange('receivingPartyType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {ENTITY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        value={formData.receivingPartyAddress}
                        onChange={(e) => handleInputChange('receivingPartyAddress', e.target.value)}
                        placeholder="Street address, city, state, zip"
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.receivingPartyAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.receivingPartyAddress && (
                        <p className="text-red-600 text-sm mt-1">{errors.receivingPartyAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Agreement Details */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Agreement Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.effectiveDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.effectiveDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Disclosure *
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="e.g., Business partnership evaluation, Technology evaluation"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.purpose ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.purpose && (
                    <p className="text-red-600 text-sm mt-1">{errors.purpose}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jurisdiction/Governing Law *
                  </label>
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.jurisdiction ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a jurisdiction...</option>
                    {JURISDICTIONS.map(jurisdiction => (
                      <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                    ))}
                  </select>
                  {errors.jurisdiction && (
                    <p className="text-red-600 text-sm mt-1">{errors.jurisdiction}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Terms & Conditions */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Terms & Conditions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agreement Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.termDuration}
                    onChange={(e) => handleInputChange('termDuration', e.target.value)}
                    placeholder="e.g., 2 years, 3 years"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.termDuration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.termDuration && (
                    <p className="text-red-600 text-sm mt-1">{errors.termDuration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Termination Notice Period *
                  </label>
                  <input
                    type="text"
                    value={formData.terminationNotice}
                    onChange={(e) => handleInputChange('terminationNotice', e.target.value)}
                    placeholder="e.g., 30 days, 60 days"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.terminationNotice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.terminationNotice && (
                    <p className="text-red-600 text-sm mt-1">{errors.terminationNotice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidentiality Survival Period *
                  </label>
                  <input
                    type="text"
                    value={formData.survivalPeriod}
                    onChange={(e) => handleInputChange('survivalPeriod', e.target.value)}
                    placeholder="e.g., 3 years, 5 years after termination"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.survivalPeriod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.survivalPeriod && (
                    <p className="text-red-600 text-sm mt-1">{errors.survivalPeriod}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return of Information Period *
                  </label>
                  <input
                    type="text"
                    value={formData.returnPeriod}
                    onChange={(e) => handleInputChange('returnPeriod', e.target.value)}
                    placeholder="e.g., 30 days"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.returnPeriod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.returnPeriod && (
                    <p className="text-red-600 text-sm mt-1">{errors.returnPeriod}</p>
                  )}
                </div>

                {formData.templateType === 'nda-comprehensive' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Information Survival Period (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.technicalSurvivalPeriod || ''}
                      onChange={(e) => handleInputChange('technicalSurvivalPeriod', e.target.value)}
                      placeholder="e.g., 5 years (if different from above)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Generate NDA
              </button>
            )}
          </div>
        </div>

        {/* Form Summary */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
          <p className="text-blue-800 text-sm">
            After completing this form, you'll be able to view your NDA, make additional edits, and download it in JSON or text format.
          </p>
        </div>
      </div>
    </div>
  );
}
