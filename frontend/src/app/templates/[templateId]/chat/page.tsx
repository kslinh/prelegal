import { Metadata } from 'next';
import ChatClient from '../ChatClient';

interface PageProps {
  params: {
    templateId: string;
  };
}

export const metadata: Metadata = {
  title: 'Create Document - Prelegal',
  description: 'Create your legal document with AI assistance',
};

export default function ChatPage({ params }: PageProps) {
  return <ChatClient templateId={params.templateId} />;
}
