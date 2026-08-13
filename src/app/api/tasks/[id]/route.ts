import { NextRequest } from 'next/server';
import { tasks, normalizeEmail, Task } from '../../mockData';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const requesterEmail = normalizeEmail(body?.requesterEmail || '');

    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const existing = tasks[idx];

    if (requesterEmail && normalizeEmail(existing.email) !== requesterEmail) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const updates: Partial<Task & { status?: string }> = {};
    if (typeof body.title === 'string') updates.title = body.title;
    if (typeof body.body === 'string') updates.body = body.body;
    if (typeof body.email === 'string') updates.email = normalizeEmail(body.email);
    if (typeof body.status === 'string') updates.status = body.status as any;

    const updated = { ...existing, ...updates } as Task & { status?: string };
    tasks[idx] = updated as any;
    return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const url = new URL(request.url);
  const requesterEmail = normalizeEmail(url.searchParams.get('requesterEmail') || '');

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const existing = tasks[idx];
  if (requesterEmail && normalizeEmail(existing.email) !== requesterEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  tasks.splice(idx, 1);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
