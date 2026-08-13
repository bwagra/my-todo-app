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
    if (!query) return [];
    const response = await fetch(buildUrl(`/tasks/users/search?query=${encodeURIComponent(query)}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
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