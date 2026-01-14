// logger.ts
// Centralized logger using winston
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'ecommerce-backend' },
  transports: [
    new transports.Console(),
    // Add file transports if needed
  ],
});

export default logger;
