import { Controller, Post, Body } from '@nestjs/common';
import { TaskService } from './tasks.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly taskService: TaskService) {}

  // POST /api/auth/signup { email, name }
  @Post('signup')
  async signup(@Body() body: any) {
    const { email, name } = body || {};
    if (!email) return { error: 'Email required' };
    const user = await this.taskService.createUser(email, name);
    // return a simple token (not secure) and user
    const token = Buffer.from(email).toString('base64');
    return { token, user };
  }

  // POST /api/auth/signin { email }
  @Post('signin')
  async signin(@Body() body: any) {
    const { email } = body || {};
    if (!email) return { error: 'Email required' };
    const user = await this.taskService.findUserByEmail(email);
    if (!user) return { error: 'User not found' };
    const token = Buffer.from(email).toString('base64');
    return { token, user };
  }
}
