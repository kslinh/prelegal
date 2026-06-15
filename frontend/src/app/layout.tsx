import type { Metadata } from 'next';
import { TemplateProvider } from '@/context/TemplateContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prelegal - Legal Templates',
  description: 'View and manage legal document templates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TemplateProvider>{children}</TemplateProvider>
      </body>
    </html>
  );
}
