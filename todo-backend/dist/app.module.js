"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const tasks_controller_1 = require("./mail/task/tasks.controller");
const tasks_service_1 = require("./mail/task/tasks.service");
const auth_controller_1 = require("./mail/task/auth.controller");
const reminders_controller_1 = require("./mail/task/reminders.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [tasks_controller_1.TaskController, auth_controller_1.AuthController, reminders_controller_1.RemindersController],
        providers: [tasks_service_1.TaskService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map