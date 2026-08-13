import { Controller, Get, Post, Query, Body, Delete, Param } from '@nestjs/common';
import { TaskService } from './tasks.service';

@Controller('api/reminders')
export class RemindersController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getFor(@Query('email') email: string) {
    if (!email) return [];
    return this.taskService.getRemindersForEmail(email);
  }

  @Post()
  async create(@Body() body: any) {
    const { taskId, email, time, message } = body || {};
    if (!taskId || !email || !time) return { error: 'Missing fields' };
    return this.taskService.createReminder({ taskId, email, time: Number(time), message });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const ok = await this.taskService.deleteReminder(id);
    return { success: ok };
  }
}
