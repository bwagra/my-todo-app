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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const fs_1 = require("fs");
const path_1 = require("path");
const tasks_service_1 = require("./tasks.service");
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    // GET /api/tasks
    async getAllTasks() {
        return this.taskService.getAllTasks();
    }
    // GET /api/tasks/users/search?query=alice
    async searchUserEmails(query) {
        return this.taskService.searchUserEmails(query);
    }
    // POST /api/tasks/save
    async saveTask(files, body) {
        const attachmentMetadata = files?.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        })) || [];
        return this.taskService.saveOrUpdateTask(body, attachmentMetadata);
    }
    // GET /api/tasks/download/:filename
    downloadFile(filename, res) {
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', filename);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Requested file does not exist on the server');
        }
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const fileStream = (0, fs_1.createReadStream)(filePath);
        fileStream.pipe(res);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getAllTasks", null);
__decorate([
    (0, common_1.Get)('users/search'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "searchUserEmails", null);
__decorate([
    (0, common_1.Post)('save'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('attachments', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "saveTask", null);
__decorate([
    (0, common_1.Get)('download/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "downloadFile", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('api/tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TaskService])
], TaskController);
//# sourceMappingURL=tasks.controller.js.map