import { NextRequest } from 'next/server';
import { tasks, normalizeEmail, Task } from '../../mockData';

function normalizeGitHubRepo(repo?: string) {
  if (!repo) return null;
  const cleaned = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  return cleaned.includes('/') ? cleaned : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const requesterEmail = normalizeEmail(body?.requesterEmail || '');

    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const existing = tasks[idx];

    const updates: Partial<Task & { status?: string }> = {};
    if (typeof body.title === 'string') updates.title = body.title;
    if (typeof body.body === 'string') updates.body = body.body;
    if (typeof body.email === 'string') updates.email = normalizeEmail(body.email);
    if (typeof body.status === 'string') updates.status = body.status as any;

    const updated = { ...existing, ...updates } as Task & { status?: string };
    tasks[idx] = updated as any;

    // If status just changed to Completed and there's a GitHub repo + token configured,
    // create a GitHub issue to notify/track this task. Store the issue URL on the task.
    try {
      const didComplete = updates.status === 'Completed' && existing.status !== 'Completed';
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const GITHUB_REPO = normalizeGitHubRepo(process.env.GITHUB_REPO) || 'bwagra/my-to-do';

      if (didComplete && GITHUB_TOKEN && GITHUB_REPO) {
        const issueTitle = `Task completed: ${updated.title}`;
        const issueBody = `Task *${updated.title}* (id: ${updated.id}) was marked as **Completed**.\n\nDetails:\n${updated.body || ''}\n\nAssignee: ${updated.email || ''}`;

        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github+json',
          },
          body: JSON.stringify({ title: issueTitle, body: issueBody, labels: ['task'] }),
        });

        if (res.ok) {
          const json = await res.json();
          (tasks[idx] as any).githubIssueUrl = json.html_url;
        } else {
          console.error('Failed to create GitHub issue', await res.text());
        }
      }
    } catch (gitErr) {
      console.error('Error creating GitHub issue:', gitErr);
    }

    return new Response(JSON.stringify(tasks[idx]), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const url = new URL(request.url);
  const requesterEmail = normalizeEmail(url.searchParams.get('requesterEmail') || '');

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

  const existing = tasks[idx];
  tasks.splice(idx, 1);
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
