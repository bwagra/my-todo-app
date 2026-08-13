export interface Task {
  id: string;
  title: string;
  dueDate: string;
  creatorEmail: string;
  assignedToEmail: string;
  status: 'Pending' | 'Completed';
}

export interface CreateTaskDTO {
  title: string;
  dueDate: string;
  creatorEmail: string;
  assignedToEmail: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

function buildUrl(path: string) {
  return BACKEND_URL ? `${BACKEND_URL}${path}` : `/api${path}`;
}

function getKnownUserEmails(): string[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('knownUserEmails') : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function setKnownUserEmail(email: string) {
  if (!email) return;
  try {
    const existing = getKnownUserEmails();
    const merged = Array.from(new Set([...existing, email.trim().toLowerCase()]));
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('knownUserEmails', JSON.stringify(merged));
    }
  } catch {
    // Ignore storage errors in non-browser or private mode.
  }
}

export const TaskApiService = {
  // Fetch tasks associated with a user's email
  async getTasks(email: string): Promise<Task[]> {
    const response = await fetch(buildUrl(`/tasks?email=${encodeURIComponent(email)}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch tasks from backend');
    return response.json();
  },

  // Post a new task and let the Angular backend handle database storage AND sending the notification email
  async createTask(taskData: CreateTaskDTO): Promise<Task> {
    const response = await fetch(buildUrl('/tasks'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create task on backend');
    return response.json();
  }
  ,
  // Search for user emails (used by TaskModal auto-suggest)
  async searchUserEmails(query: string): Promise<string[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return getKnownUserEmails();

    let backendResults: string[] = [];
    try {
      const response = await fetch(buildUrl(`/tasks/users/search?query=${encodeURIComponent(normalizedQuery)}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        backendResults = Array.isArray(data) ? data : [];
      }
    } catch {
      backendResults = [];
    }

    const known = getKnownUserEmails();
    return Array.from(new Set([...known, ...backendResults]))
      .filter((email) => email.toLowerCase().includes(normalizedQuery.toLowerCase()))
      .sort();
  }
  ,
  // Save task with multipart/form-data (file uploads)
  async saveTask(formData: FormData): Promise<any> {
    const response = await fetch(buildUrl('/tasks/save'), {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to save task');
    }
    return response.json();
  },

  // Helper to build download URLs for attachments
  getDownloadUrl(filename: string) {
    return buildUrl(`/tasks/download/${encodeURIComponent(filename)}`);
  },
  async updateTask(id: string, payload: any) {
    const res = await fetch(buildUrl(`/tasks/${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Update task failed');
    }
    return res.json();
  },
  async deleteTask(id: string, requesterEmail?: string) {
    const url = requesterEmail
      ? buildUrl(`/tasks/${encodeURIComponent(id)}?requesterEmail=${encodeURIComponent(requesterEmail)}`)
      : buildUrl(`/tasks/${encodeURIComponent(id)}`);
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Delete task failed');
    }
    return res.json();
  },
  // --- Reminders ---
  async getReminders(email: string) {
    const res = await fetch(buildUrl(`/reminders?email=${encodeURIComponent(email)}`));
    if (!res.ok) return [];
    return res.json();
  },
  async createReminder(payload: { taskId: string; email: string; time: number; message?: string }) {
    const res = await fetch(buildUrl('/reminders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Create reminder failed');
    return res.json();
  },
  async deleteReminder(id: string) {
    const res = await fetch(buildUrl(`/reminders/${encodeURIComponent(id)}`), { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete reminder failed');
    return res.json();
  }
};