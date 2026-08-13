import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';

// Ensure the target upload folder exists before Multer tries to save files
const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          callback(null, uploadDir);
        },
        filename: (req, file, callback) => {
          // Generate a safe unique filename: timestamp + random hash + original extension
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          const sanitizedOriginalName = file.originalname
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9]/g, '_');
          
          callback(null, `${sanitizedOriginalName}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit per file
      },
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}