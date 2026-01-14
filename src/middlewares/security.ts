// security.ts
// Security middleware setup (helmet, CORS)
import helmet from "helmet";
import cors from "cors";
import { NODE_ENV } from "../config/env";

export const securityMiddleware = [
  helmet(),
  cors({
    origin: NODE_ENV === "production" ? ["https://yourdomain.com"] : true,
    credentials: true,
  }),
];
