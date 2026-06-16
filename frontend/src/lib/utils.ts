import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CustomizationMap, Template } from '@/types/template';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function applyCustomizations(
  content: string,
  values: CustomizationMap
): string {
  let result = content;
  for (const [fieldName, fieldValue] of Object.entries(values)) {
    const placeholder = `[${fieldName}]`;
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escapedPlaceholder, 'g'), fieldValue);
  }
  return result;
}

export function customizeTemplate(
  template: Template,
  customizations: CustomizationMap
): Template {
  const customized = JSON.parse(JSON.stringify(template));

  for (const section of customized.sections) {
    for (const [fieldName, fieldValue] of Object.entries(customizations)) {
      const placeholder = `[${fieldName}]`;
      if (section.content.includes(placeholder)) {
        const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        section.content = section.content.replace(
          new RegExp(escapedPlaceholder, 'g'),
          fieldValue
        );
      }
    }
  }

  for (const field of customized.customizableFields) {
    if (field.name in customizations) {
      field.value = customizations[field.name];
    }
  }

  return customized;
}

export function exportAsText(template: Template): string {
  let output = `# ${template.name}\n\n`;
  output += `${template.description}\n\n`;

  for (const section of template.sections) {
    output += `## ${section.title}\n\n`;
    output += `${section.content}\n\n`;
  }

  return output;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'non-disclosure': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  services: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  employment: 'bg-amber-100 text-amber-700 border-amber-200',
  commercial: 'bg-rose-100 text-rose-700 border-rose-200',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['non-disclosure'];
}
