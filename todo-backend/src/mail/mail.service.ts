import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter = {
    sendMail: async (_mailOptions: unknown) => {
      console.log('Email sending is disabled in this environment.');
    },
  };

  async sendTaskAssignmentEmail(
    toEmail: string,
    taskTitle: string,
    assignedBy: string,
  ): Promise<void> {
    const mailOptions = {
      from: '"Task Manager" <no-reply@taskmanager.com>',
      to: toEmail,
      subject: 'New Task Assigned to You',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>You have a new task assigned!</h2>
          <p><strong>Assigned By:</strong> ${assignedBy}</p>
          <p><strong>Task Title:</strong> ${taskTitle}</p>
          <p>Please log in to your dashboard to review and complete it.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Assignment email sent successfully to ${toEmail}`);
    } catch (error) {
      console.error(`Failed to send email to ${toEmail}:`, error);
    }
  }
}