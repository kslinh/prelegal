import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import ChatClient from '../ChatClient';

interface PageProps {
  params: {
    templateId: string;
  };
}

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

export const metadata: Metadata = {
  title: 'Create Document - Prelegal',
  description: 'Create your legal document with AI assistance',
};

export default function ChatPage({ params }: PageProps) {
  return <ChatClient templateId={params.templateId} />;
}
