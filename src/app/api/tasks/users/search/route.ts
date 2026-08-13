import { NextRequest } from 'next/server';
import { tasks, normalizeEmail, userEmails } from '../../../mockData';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = normalizeEmail(url.searchParams.get('query') || '');
  if (!query) {
    return new Response(JSON.stringify(userEmails), { headers: { 'Content-Type': 'application/json' } });
  }

  const results = Array.from(new Set([
    ...userEmails,
    ...tasks.map((task) => task.email),
  ])).filter((email) => normalizeEmail(email).includes(query));

  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
