import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskResponse } from './task.dto';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /api/tasks?email=user@example.com
   * Handles task retrieval for the logged-in Next.js user
   */
  @Get()
  async getTasks(@Query('email') email: string): Promise<TaskResponse[]> {
    if (!email) {
      throw new BadRequestException('Query parameter "email" is required');
    }
    return this.tasksService.findTasksByUserEmail(email as string);
  }
}