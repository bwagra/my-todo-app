"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const tasks_controller_1 = require("./tasks.controller");
const tasks_service_1 = require("./tasks.service");
// Ensure the target upload folder exists before Multer tries to save files
const uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
if (!(0, fs_1.existsSync)(uploadDir)) {
    (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
}
let TaskModule = class TaskModule {
};
exports.TaskModule = TaskModule;
exports.TaskModule = TaskModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, callback) => {
                        callback(null, uploadDir);
                    },
                    filename: (req, file, callback) => {
                        // Generate a safe unique filename: timestamp + random hash + original extension
                        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                        const ext = (0, path_1.extname)(file.originalname);
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
        controllers: [tasks_controller_1.TaskController],
        providers: [tasks_service_1.TaskService],
        exports: [tasks_service_1.TaskService],
    })
], TaskModule);
//# sourceMappingURL=task.module.js.map