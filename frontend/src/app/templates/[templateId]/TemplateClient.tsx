'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TemplateViewer from '@/components/TemplateViewer';
import { Template } from '@/types/template';

interface TemplateClientProps {
  templateId: string;
}

export default function TemplateClient({ templateId }: TemplateClientProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <Link href="/" className="text-indigo-600 hover:underline">
          Back to templates
        </Link>
      </div>
    );
  }

  return <TemplateViewer template={template} />;
}
