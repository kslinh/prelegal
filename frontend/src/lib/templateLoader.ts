import path from 'path';
import fs from 'fs/promises';
import {
  Template,
  TemplateIndex,
} from '@/types/template';

const TEMPLATES_DIR = path.resolve(process.cwd(), '..', 'templates');

export async function loadIndex(): Promise<TemplateIndex> {
  const indexPath = path.join(TEMPLATES_DIR, 'index.json');
  const content = await fs.readFile(indexPath, 'utf-8');
  return JSON.parse(content);
}

export async function getTemplate(templateId: string): Promise<Template | null> {
  try {
    const index = await loadIndex();
    const templateInfo = index.templates.find((t) => t.id === templateId);

    if (!templateInfo) {
      return null;
    }

    const templatePath = path.join(TEMPLATES_DIR, templateInfo.file);
    const content = await fs.readFile(templatePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading template ${templateId}:`, error);
    return null;
  }
}


