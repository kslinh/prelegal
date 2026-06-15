import { notFound } from 'next/navigation';
import { getTemplate } from '@/lib/templateLoader';
import TemplateViewer from '@/components/TemplateViewer';
import type { Metadata } from 'next';

interface TemplatePageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: TemplatePageProps): Promise<Metadata> {
  const template = await getTemplate(params.id);

  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return {
    title: `${template.name} - Prelegal`,
    description: template.description,
  };
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const template = await getTemplate(params.id);

  if (!template) {
    notFound();
  }

  return <TemplateViewer template={template} />;
}
