import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const PORT = process.env.PORT || 8080;
  await app.listen(PORT);
  console.log(`Backend API Server running on port: ${PORT}`);
}
bootstrap();