import type { Metadata } from 'next';
import { TemplateProvider } from '@/context/TemplateContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
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
        <ProtectedRoute>
          <TemplateProvider>
            <Header />
            {children}
          </TemplateProvider>
        </ProtectedRoute>
      </body>
    </html>
  );
}
