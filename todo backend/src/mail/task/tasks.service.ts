import { Injectable } from '@nestjs/common';
import { CreateTaskDto, TaskResponse } from './task.dto';
import { MailService } from '../mail.service';

@Injectable()
export class TasksService {
  // In-memory array (Replace with TypeORM/Prisma DB model when connecting to SQL/Mongo)
  private tasks: TaskResponse[] = [];

  constructor(private readonly mailService: MailService) {}

  // Fetch tasks where user is EITHER creator OR assignee
  async findTasksByUserEmail(email: string): Promise<TaskResponse[]> {
    const lowerEmail = email.toLowerCase();
    return this.tasks.filter(
      (task) =>
        task.creatorEmail.toLowerCase() === lowerEmail ||
        task.assignedToEmail.toLowerCase() === lowerEmail,
    );
  }

  // Create task & send notification if assigned to another user
  async createTask(dto: CreateTaskDto): Promise<TaskResponse> {
    const newTask: TaskResponse = {
      id: Math.random().toString(36).substring(2, 9), // Simple UUID generator
      title: dto.title,
      dueDate: dto.dueDate,
      creatorEmail: dto.creatorEmail,
      assignedToEmail: dto.assignedToEmail,
      status: 'Pending',
      createdAt: new Date(),
    };

    this.tasks.push(newTask);

    // If task is assigned to someone else, trigger email dispatch asynchronously
    if (
      dto.assignedToEmail &&
      dto.assignedToEmail.toLowerCase() !== dto.creatorEmail.toLowerCase()
    ) {
      await this.mailService.sendTaskAssignmentEmail(
        dto.assignedToEmail,
        dto.title,
        dto.creatorEmail,
      );
    }

    return newTask;
  }
}