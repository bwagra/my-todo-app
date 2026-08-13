"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
let MailService = class MailService {
    constructor() {
        this.transporter = {
            sendMail: async (_mailOptions) => {
                console.log('Email sending is disabled in this environment.');
            },
        };
    }
    async sendTaskAssignmentEmail(toEmail, taskTitle, assignedBy) {
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
        }
        catch (error) {
            console.error(`Failed to send email to ${toEmail}:`, error);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map