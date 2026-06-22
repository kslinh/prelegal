import fs from 'fs';
import path from 'path';
import TemplateClient from './TemplateClient';

// Statically enumerate template IDs at build time from the templates index.
// This runs in Node during `next build`, so it reads the catalog directly
// instead of calling the backend (which isn't running during the build).
export async function generateStaticParams() {
  try {
    const indexPath = path.join(process.cwd(), '..', 'templates', 'index.json');
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    return (data.templates || []).map((template: { id: string }) => ({
      templateId: template.id,
    }));
  } catch {
    return [];
  }
}

export default function TemplatePage({
  params,
}: {
  params: { templateId: string };
}) {
  return <TemplateClient templateId={params.templateId} />;
}
