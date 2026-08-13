import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Res,
  Body,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { TaskService } from './tasks.service';

@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // GET /api/tasks
  @Get()
  async getAllTasks() {
    return this.taskService.getAllTasks();
  }

  // GET /api/tasks/users/search?query=alice
  @Get('users/search')
  async searchUserEmails(@Query('query') query: string) {
    return this.taskService.searchUserEmails(query);
  }

  // POST /api/tasks/save
  @Post('save')
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async saveTask(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any
  ) {
    const attachmentMetadata =
      files?.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })) || [];

    return this.taskService.saveOrUpdateTask(body, attachmentMetadata);
  }

  // GET /api/tasks/download/:filename
  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Requested file does not exist on the server');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}