export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
  modifiable: boolean;
}

export interface CustomizableField {
  name: string;
  placeholder: string;
  required: boolean;
  type?: 'text' | 'select';
  options?: string[];
  value?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  source?: string;
  sections: TemplateSection[];
  customizableFields: CustomizableField[];
}

export interface TemplateIndexEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  file: string;
  version: string;
}

export interface Category {
  name: string;
  description: string;
}

export interface TemplateIndex {
  version: string;
  lastUpdated: string;
  templates: TemplateIndexEntry[];
  categories: Category[];
}

export interface CustomizationMap {
  [fieldName: string]: string;
}
