import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("stock_api"),
  DB_SYNC: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("1d"),
  ALPHA_VANTAGE_API_KEY: z.string().min(5),
  ALPHA_VANTAGE_SYMBOL: z.string().default("AAPL"),
  ALPHA_VANTAGE_OUTPUT_SIZE: z.enum(["compact", "full"]).default("compact"),
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  AZURE_STORAGE_CONTAINER_NAME: z.string().min(1),
  AZURE_STORAGE_SAS_EXPIRES_MINUTES: z.coerce.number().default(30),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment variables: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
