"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// logger.ts
// Centralized logger using winston
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    defaultMeta: { service: 'ecommerce-backend' },
    transports: [
        new winston_1.transports.Console(),
        // Add file transports if needed
    ],
});
exports.default = logger;
