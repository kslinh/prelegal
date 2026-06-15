import { getTemplate } from '@/lib/templateLoader';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await getTemplate(params.id);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(template);
  } catch (error) {
    console.error(`Error loading template ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to load template' },
      { status: 500 }
    );
  }
}
