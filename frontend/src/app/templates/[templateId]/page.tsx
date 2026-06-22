import { notFound } from 'next/navigation';
import TemplateViewer from '@/components/TemplateViewer';
import { Template } from '@/types/template';

async function getTemplate(templateId: string): Promise<Template | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/templates/${templateId}`,
      { cache: 'no-store' }
    );
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/templates`
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return (data.templates || []).map((template: any) => ({
      templateId: template.id,
    }));
  } catch {
    return [];
  }
}

export default async function TemplatePage({
  params,
}: {
  params: { templateId: string };
}) {
  const template = await getTemplate(params.templateId);

  if (!template) {
    notFound();
  }

  return <TemplateViewer template={template} />;
}
