"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../../app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
//# sourceMappingURL=main.js.map