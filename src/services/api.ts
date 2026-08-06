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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000';

export const TaskApiService = {
  // Fetch tasks associated with a user's email
  async getTasks(email: string): Promise<Task[]> {
    const response = await fetch(`${BACKEND_URL}/api/tasks?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch tasks from backend');
    return response.json();
  },

  // Post a new task and let the Angular backend handle database storage AND sending the notification email
  async createTask(taskData: CreateTaskDTO): Promise<Task> {
    const response = await fetch(`${BACKEND_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create task on backend');
    return response.json();
  }
};