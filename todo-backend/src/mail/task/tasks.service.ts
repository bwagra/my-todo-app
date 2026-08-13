import { Injectable } from '@nestjs/common';

export interface Task {
  id: string;
  title: string;
  body: string;
  email: string;
  attachments?: any[];
}

export interface Reminder {
  id: string;
  taskId: string;
  email: string;
  time: number; // epoch ms
  message?: string;
}

export interface User {
  email: string;
  name?: string;
}

@Injectable()
export class TaskService {
  // In-memory array or database repository
  private tasks: Task[] = [];

  // Mock list of registered user emails for auto-suggest
  private userEmails: string[] = [
    'alice.smith@workspace.com',
    'bob.jones@workspace.com',
    'charlie.brown@workspace.com',
    'david.miller@workspace.com',
    'eva.green@workspace.com',
  ];

  // Simple in-memory users and reminders
  private users: User[] = this.userEmails.map((e) => ({ email: e }));
  private reminders: Reminder[] = [];

  // 1. Get all tasks
  async getAllTasks(): Promise<Task[]> {
    return this.tasks;
  }

  // 2. Save or update task
  async saveOrUpdateTask(taskData: any, newAttachments: any[] = []): Promise<Task> {
    if (taskData.id) {
      // Edit existing task
      const existingTaskIndex = this.tasks.findIndex((t) => t.id === taskData.id);
      if (existingTaskIndex !== -1) {
        const existingTask = this.tasks[existingTaskIndex];
        const updatedTask = {
          ...existingTask,
          title: taskData.title,
          body: taskData.body,
          email: taskData.email,
          attachments: [
            ...(existingTask.attachments || []),
            ...newAttachments,
          ],
        };
        this.tasks[existingTaskIndex] = updatedTask;
        return updatedTask;
      }
    }

    // Create new task
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      body: taskData.body,
      email: taskData.email,
      attachments: newAttachments,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // 3. Email search for auto-suggest (Replacing UserService)
  async searchUserEmails(query: string): Promise<string[]> {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return this.userEmails.filter((email) =>
      email.toLowerCase().includes(lowerQuery)
    );
  }

  // --- Users (very simple) ---
  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async createUser(email: string, name?: string): Promise<User> {
    const existing = await this.findUserByEmail(email);
    if (existing) return existing;
    const u = { email, name };
    this.users.push(u);
    // keep email index for suggestions
    if (!this.userEmails.includes(email)) this.userEmails.push(email);
    return u;
  }

  // --- Reminders ---
  async getRemindersForEmail(email: string): Promise<Reminder[]> {
    return this.reminders.filter((r) => r.email === email);
  }

  async createReminder(reminderData: { taskId: string; email: string; time: number; message?: string; }): Promise<Reminder> {
    const r: Reminder = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      taskId: reminderData.taskId,
      email: reminderData.email,
      time: reminderData.time,
      message: reminderData.message || 'Reminder',
    };
    this.reminders.push(r);
    return r;
  }

  async deleteReminder(id: string): Promise<boolean> {
    const idx = this.reminders.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.reminders.splice(idx, 1);
    return true;
  }
}