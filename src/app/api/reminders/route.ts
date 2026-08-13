import { NextRequest } from 'next/server';
import { reminders, normalizeEmail, generateId } from '../mockData';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get('email') || '');
  const results = email ? reminders.filter((reminder) => normalizeEmail(reminder.email) === email) : reminders;
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const taskId = String(body.taskId || '');
  const email = normalizeEmail(String(body.email || ''));
  const time = Number(body.time);
  const message = String(body.message || `Reminder for ${taskId}`);

  if (!taskId || !email || !time) {
    return new Response(JSON.stringify({ error: 'Missing reminder payload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const newReminder = {
    id: generateId('reminder'),
    taskId,
    email,
    time,
    message,
  };

  reminders.push(newReminder);
  return new Response(JSON.stringify(newReminder), { headers: { 'Content-Type': 'application/json' } });
}
