'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTemplateContext } from '@/context/TemplateContext';
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
  templateType: 'nda-comprehensive', // nda-001, mnda-001, or nda-comprehensive
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
  { value: 'nda-001', label: 'Standard NDA (One-Way)', desc: 'One-way confidentiality obligations' },
  { value: 'mnda-001', label: 'Mutual NDA (Two-Way)', desc: 'Two-way confidentiality obligations' },
  { value: 'nda-comprehensive', label: 'Comprehensive NDA (Advanced)', desc: 'Advanced with detailed provisions' },
];

export default function NDAForm({ onSubmit }: { onSubmit?: (data: NDAFormData) => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<NDAFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const { dispatch } = useTemplateContext();

  const handleInputChange = (field: keyof NDAFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const templateId = formData.templateType;

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
        // Use Next.js router for smooth client-side navigation
        setTimeout(() => {
          router.push(`/templates/${templateId}`);
        }, 100);
      }
    }
  };

  const templateName = TEMPLATE_OPTIONS.find(t => t.value === formData.templateType)?.label || 'NDA';
  const entityTypeLabel = (type: string) => ENTITY_TYPES.find(e => e.value === type)?.label || type;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">NDA Generator</h1>
          </div>
          <div className="text-sm font-medium text-gray-600">Step {step} of 4</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Progress</h3>
                <span className="text-sm text-gray-600">{Math.round((step / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-4">
                {[1, 2, 3, 4].map(stepNum => (
                  <button
                    key={stepNum}
                    onClick={() => stepNum <= step && setStep(stepNum)}
                    className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                      step === stepNum
                        ? 'bg-indigo-600 text-white'
                        : step > stepNum
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > stepNum ? '✓' : stepNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow p-6">
              {/* Step 1: Template Selection */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Choose NDA Type</h2>
                  <div className="space-y-3">
                    {TEMPLATE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-indigo-50" style={{
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
                        <div className="ml-3">
                          <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                          <p className="text-xs text-gray-600">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Party Information */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Party Information</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Company</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                          <input
                            type="text"
                            value={formData.disclosingPartyName}
                            onChange={(e) => handleInputChange('disclosingPartyName', e.target.value)}
                            placeholder="Company or individual name"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.disclosingPartyName ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.disclosingPartyName && <p className="text-red-600 text-xs mt-1">{errors.disclosingPartyName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                          <select
                            value={formData.disclosingPartyType}
                            onChange={(e) => handleInputChange('disclosingPartyType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {ENTITY_TYPES.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
                          <textarea
                            value={formData.disclosingPartyAddress}
                            onChange={(e) => handleInputChange('disclosingPartyAddress', e.target.value)}
                            placeholder="Street address, city, state, zip"
                            rows={2}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.disclosingPartyAddress ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.disclosingPartyAddress && <p className="text-red-600 text-xs mt-1">{errors.disclosingPartyAddress}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Counterparty</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                          <input
                            type="text"
                            value={formData.receivingPartyName}
                            onChange={(e) => handleInputChange('receivingPartyName', e.target.value)}
                            placeholder="Company or individual name"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.receivingPartyName ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.receivingPartyName && <p className="text-red-600 text-xs mt-1">{errors.receivingPartyName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                          <select
                            value={formData.receivingPartyType}
                            onChange={(e) => handleInputChange('receivingPartyType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {ENTITY_TYPES.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
                          <textarea
                            value={formData.receivingPartyAddress}
                            onChange={(e) => handleInputChange('receivingPartyAddress', e.target.value)}
                            placeholder="Street address, city, state, zip"
                            rows={2}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.receivingPartyAddress ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.receivingPartyAddress && <p className="text-red-600 text-xs mt-1">{errors.receivingPartyAddress}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Agreement Details */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Agreement Details</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Effective Date *</label>
                      <input
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.effectiveDate && <p className="text-red-600 text-xs mt-1">{errors.effectiveDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Purpose of Disclosure *</label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                        placeholder="e.g., Business partnership evaluation"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.purpose ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.purpose && <p className="text-red-600 text-xs mt-1">{errors.purpose}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Jurisdiction *</label>
                      <select
                        value={formData.jurisdiction}
                        onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.jurisdiction ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select jurisdiction...</option>
                        {JURISDICTIONS.map(jurisdiction => (
                          <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                        ))}
                      </select>
                      {errors.jurisdiction && <p className="text-red-600 text-xs mt-1">{errors.jurisdiction}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Terms */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duration *</label>
                      <input
                        type="text"
                        value={formData.termDuration}
                        onChange={(e) => handleInputChange('termDuration', e.target.value)}
                        placeholder="e.g., 2 years"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.termDuration ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.termDuration && <p className="text-red-600 text-xs mt-1">{errors.termDuration}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Termination Notice *</label>
                      <input
                        type="text"
                        value={formData.terminationNotice}
                        onChange={(e) => handleInputChange('terminationNotice', e.target.value)}
                        placeholder="e.g., 30 days"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.terminationNotice ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.terminationNotice && <p className="text-red-600 text-xs mt-1">{errors.terminationNotice}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Survival Period *</label>
                      <input
                        type="text"
                        value={formData.survivalPeriod}
                        onChange={(e) => handleInputChange('survivalPeriod', e.target.value)}
                        placeholder="e.g., 3 years after termination"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.survivalPeriod ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.survivalPeriod && <p className="text-red-600 text-xs mt-1">{errors.survivalPeriod}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Return Period *</label>
                      <input
                        type="text"
                        value={formData.returnPeriod}
                        onChange={(e) => handleInputChange('returnPeriod', e.target.value)}
                        placeholder="e.g., 30 days"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.returnPeriod ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.returnPeriod && <p className="text-red-600 text-xs mt-1">{errors.returnPeriod}</p>}
                    </div>

                    {formData.templateType === 'nda-comprehensive' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Technical Survival (Optional)</label>
                        <input
                          type="text"
                          value={formData.technicalSurvivalPeriod || ''}
                          onChange={(e) => handleInputChange('technicalSurvivalPeriod', e.target.value)}
                          placeholder="e.g., 5 years"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-6 flex justify-between gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>

                {step < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Generate NDA
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Preview Summary or Chat */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'summary'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  AI Assistant
                </button>
              </div>

              {/* Summary Tab */}
              {activeTab === 'summary' && (
              <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>

                {/* Template Type */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">NDA Type</p>
                  <p className="text-sm font-medium text-gray-900">{templateName}</p>
                </div>

                {/* Party Information */}
                {(formData.disclosingPartyName || formData.receivingPartyName) && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Parties</p>
                    {formData.disclosingPartyName && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Disclosing Party</p>
                        <p className="text-sm font-medium text-gray-900">{formData.disclosingPartyName}</p>
                        {formData.disclosingPartyType && (
                          <p className="text-xs text-gray-600">{entityTypeLabel(formData.disclosingPartyType)}</p>
                        )}
                      </div>
                    )}
                    {formData.receivingPartyName && (
                      <div>
                        <p className="text-xs text-gray-600">Receiving Party</p>
                        <p className="text-sm font-medium text-gray-900">{formData.receivingPartyName}</p>
                        {formData.receivingPartyType && (
                          <p className="text-xs text-gray-600">{entityTypeLabel(formData.receivingPartyType)}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Agreement Details */}
                {(formData.effectiveDate || formData.purpose || formData.jurisdiction) && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Details</p>
                    {formData.effectiveDate && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">Effective Date</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(formData.effectiveDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {formData.purpose && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">Purpose</p>
                        <p className="text-sm font-medium text-gray-900">{formData.purpose}</p>
                      </div>
                    )}
                    {formData.jurisdiction && (
                      <div>
                        <p className="text-xs text-gray-600">Jurisdiction</p>
                        <p className="text-sm font-medium text-gray-900">{formData.jurisdiction}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Terms */}
                {(formData.termDuration || formData.terminationNotice || formData.survivalPeriod || formData.returnPeriod) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Terms</p>
                    {formData.termDuration && (
                      <div className="mb-2 flex justify-between">
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{formData.termDuration}</p>
                      </div>
                    )}
                    {formData.terminationNotice && (
                      <div className="mb-2 flex justify-between">
                        <p className="text-xs text-gray-600">Termination Notice</p>
                        <p className="text-sm font-medium text-gray-900">{formData.terminationNotice}</p>
                      </div>
                    )}
                    {formData.survivalPeriod && (
                      <div className="mb-2 flex justify-between">
                        <p className="text-xs text-gray-600">Survival Period</p>
                        <p className="text-sm font-medium text-gray-900">{formData.survivalPeriod}</p>
                      </div>
                    )}
                    {formData.returnPeriod && (
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-600">Return Period</p>
                        <p className="text-sm font-medium text-gray-900">{formData.returnPeriod}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>💡 Tip:</strong> Fill in all fields marked with * to generate your NDA. Your entries will be displayed here as you fill them in.
                </p>
              </div>

              {/* Completion Status */}
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Completion</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {formData.templateType ? '✓' : '○'} <span className="text-gray-700">Template selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.disclosingPartyName && formData.receivingPartyName ? '✓' : '○'} <span className="text-gray-700">Parties entered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.effectiveDate && formData.jurisdiction ? '✓' : '○'} <span className="text-gray-700">Details filled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.termDuration && formData.returnPeriod ? '✓' : '○'} <span className="text-gray-700">Terms defined</span>
                  </div>
                </div>
              </div>
              </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
              <NDAChat
                formData={formData}
                onFieldsExtracted={(fields) => {
                  Object.entries(fields).forEach(([key, value]) => {
                    if (value) {
                      handleInputChange(key as keyof NDAFormData, value);
                    }
                  });
                }}
              />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
