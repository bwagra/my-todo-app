import { NextRequest } from 'next/server';
import { tasks, normalizeEmail, generateId, Task } from '../mockData';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get('email') || '');
  const results = email ? tasks.filter((task) => normalizeEmail(task.email) === email) : tasks;
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const title = typeof body.title === 'string' ? body.title : '';
  const taskBody = typeof body.body === 'string' ? body.body : '';
  const email = normalizeEmail(typeof body.email === 'string' ? body.email : '');
  const id = typeof body.id === 'string' && body.id ? body.id : generateId('task');

  if (!title || !email) {
    return new Response(JSON.stringify({ error: 'Missing title or email' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const existingIndex = tasks.findIndex((task) => task.id === id);
  const newTask: Task = {
    id,
    title,
    body: taskBody,
    email,
    status: 'Pending',
    dueDate: new Date().toISOString(),
    attachments: [],
  };

  if (existingIndex >= 0) {
    tasks[existingIndex] = { ...tasks[existingIndex], ...newTask };
    return new Response(JSON.stringify(tasks[existingIndex]), { headers: { 'Content-Type': 'application/json' } });
  }

  tasks.push(newTask);
  return new Response(JSON.stringify(newTask), { headers: { 'Content-Type': 'application/json' } });
}
