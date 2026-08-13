export interface Task {
  id: string;
  title: string;
  body: string;
  email: string;
  status: 'Pending' | 'Completed';
  dueDate?: string;
  attachments?: { filename: string; originalName?: string }[];
  githubIssueUrl?: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  email: string;
  time: number;
  message: string;
}

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Prepare weekly report',
    body: 'Gather metrics and write summary for the weekly team update.',
    email: 'alice@example.com',
    status: 'Pending',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    attachments: [],
  },
  {
    id: 'task-2',
    title: 'Review design mockups',
    body: 'Review the latest UI mockups and provide feedback to the design team.',
    email: 'bob@example.com',
    status: 'Completed',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const reminders: Reminder[] = [
  {
    id: 'reminder-1',
    taskId: 'task-1',
    email: 'alice@example.com',
    time: Date.now() + 1000 * 60 * 5,
    message: 'Reminder to finalize the weekly report.',
  },
];

export const userEmails = Array.from(new Set(tasks.map((task) => task.email)));

export function normalizeEmail(email?: string) {
  return (email || '').trim().toLowerCase();
}

export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
