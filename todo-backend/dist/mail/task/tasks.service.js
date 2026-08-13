"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
let TaskService = class TaskService {
    constructor() {
        // In-memory array or database repository
        this.tasks = [];
        // Mock list of registered user emails for auto-suggest
        this.userEmails = [
            'alice.smith@workspace.com',
            'bob.jones@workspace.com',
            'charlie.brown@workspace.com',
            'david.miller@workspace.com',
            'eva.green@workspace.com',
        ];
        // Simple in-memory users and reminders
        this.users = this.userEmails.map((e) => ({ email: e }));
        this.reminders = [];
    }
    // 1. Get all tasks
    async getAllTasks() {
        return this.tasks;
    }
    // 2. Save or update task
    async saveOrUpdateTask(taskData, newAttachments = []) {
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
        const newTask = {
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
    async searchUserEmails(query) {
        if (!query)
            return [];
        const lowerQuery = query.toLowerCase();
        return this.userEmails.filter((email) => email.toLowerCase().includes(lowerQuery));
    }
    // --- Users (very simple) ---
    async findUserByEmail(email) {
        return this.users.find((u) => u.email === email);
    }
    async createUser(email, name) {
        const existing = await this.findUserByEmail(email);
        if (existing)
            return existing;
        const u = { email, name };
        this.users.push(u);
        // keep email index for suggestions
        if (!this.userEmails.includes(email))
            this.userEmails.push(email);
        return u;
    }
    // --- Reminders ---
    async getRemindersForEmail(email) {
        return this.reminders.filter((r) => r.email === email);
    }
    async createReminder(reminderData) {
        const r = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
            taskId: reminderData.taskId,
            email: reminderData.email,
            time: reminderData.time,
            message: reminderData.message || 'Reminder',
        };
        this.reminders.push(r);
        return r;
    }
    async deleteReminder(id) {
        const idx = this.reminders.findIndex((r) => r.id === id);
        if (idx === -1)
            return false;
        this.reminders.splice(idx, 1);
        return true;
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)()
], TaskService);
//# sourceMappingURL=tasks.service.js.map