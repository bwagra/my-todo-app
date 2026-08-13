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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
let AuthController = class AuthController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    // POST /api/auth/signup { email, name }
    async signup(body) {
        const { email, name } = body || {};
        if (!email)
            return { error: 'Email required' };
        const user = await this.taskService.createUser(email, name);
        // return a simple token (not secure) and user
        const token = Buffer.from(email).toString('base64');
        return { token, user };
    }
    // POST /api/auth/signin { email }
    async signin(body) {
        const { email } = body || {};
        if (!email)
            return { error: 'Email required' };
        const user = await this.taskService.findUserByEmail(email);
        if (!user)
            return { error: 'User not found' };
        const token = Buffer.from(email).toString('base64');
        return { token, user };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [tasks_service_1.TaskService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map