import { NextRequest } from 'next/server';
import { tasks, normalizeEmail, generateId, Task } from '../../mockData';

async function createGitHubIssue(task: Task) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'bwagra/my-to-do';

  if (!token) {
    console.warn('GITHUB_TOKEN is not configured; skipping GitHub issue creation.');
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        body: [
          task.body || 'No description provided.',
          '',
          `- Assignee: ${task.email}`,
          `- Status: ${task.status}`,
          `- Created from app task: ${task.id}`,
        ].join('\n'),
        labels: ['task'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create GitHub issue:', response.status, errorText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const id = formData.get('id')?.toString() || '';
  const title = formData.get('title')?.toString() || '';
  const body = formData.get('body')?.toString() || '';
  const email = normalizeEmail(formData.get('email')?.toString() || '');
  const attachments: Task['attachments'] = [];

  for (const entry of formData.getAll('attachments')) {
    if (entry instanceof File) {
      attachments.push({ filename: entry.name, originalName: entry.name });
    }
  }

  if (!title || !email) {
    return new Response(JSON.stringify({ error: 'Title and email are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const existingIndex = id ? tasks.findIndex((task) => task.id === id) : -1;
  const newTask: Task = {
    id: existingIndex >= 0 ? id : generateId('task'),
    title,
    body,
    email,
    status: 'Pending',
    dueDate: new Date().toISOString(),
    attachments,
  };

  if (existingIndex >= 0) {
    tasks[existingIndex] = { ...tasks[existingIndex], ...newTask };
    return new Response(JSON.stringify(tasks[existingIndex]), { headers: { 'Content-Type': 'application/json' } });
  }

  const issue = await createGitHubIssue(newTask);
  if (issue?.html_url) {
    newTask.githubIssueUrl = issue.html_url;
  }

  tasks.push(newTask);
  return new Response(JSON.stringify(newTask), { headers: { 'Content-Type': 'application/json' } });
}
