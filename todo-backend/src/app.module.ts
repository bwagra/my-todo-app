import { Module } from '@nestjs/common';
import { TaskController } from './mail/task/tasks.controller';
import { TaskService } from './mail/task/tasks.service';
import { AuthController } from './mail/task/auth.controller';
import { RemindersController } from './mail/task/reminders.controller';

@Module({
  imports: [],
  controllers: [TaskController, AuthController, RemindersController],
  providers: [TaskService],
})
export class AppModule {}