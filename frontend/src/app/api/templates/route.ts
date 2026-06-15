import { loadIndex } from '@/lib/templateLoader';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const index = await loadIndex();
    return NextResponse.json({
      templates: index.templates,
      categories: index.categories,
    });
  } catch (error) {
    console.error('Error loading templates:', error);
    return NextResponse.json(
      { error: 'Failed to load templates' },
      { status: 500 }
    );
  }
}
