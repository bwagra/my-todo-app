import { Module } from '@nestjs/common';
import { TasksController } from './mail/task/tasks.controller';
import { TasksService } from './mail/task/tasks.service';

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [TasksService],
})
export class AppModule {}