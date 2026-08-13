"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersController = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
let RemindersController = class RemindersController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    async getFor(email) {
        if (!email)
            return [];
        return this.taskService.getRemindersForEmail(email);
    }
    async create(body) {
        const { taskId, email, time, message } = body || {};
        if (!taskId || !email || !time)
            return { error: 'Missing fields' };
        return this.taskService.createReminder({ taskId, email, time: Number(time), message });
    }
    async remove(id) {
        const ok = await this.taskService.deleteReminder(id);
        return { success: ok };
    }
};
exports.RemindersController = RemindersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "getFor", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "remove", null);
exports.RemindersController = RemindersController = __decorate([
    (0, common_1.Controller)('api/reminders'),
    __metadata("design:paramtypes", [tasks_service_1.TaskService])
], RemindersController);
//# sourceMappingURL=reminders.controller.js.map