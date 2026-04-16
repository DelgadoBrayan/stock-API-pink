import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { UserEntity } from "../modules/auth/entities/user.entity";
import { QuoteCacheEntity } from "../modules/market/entities/quote-cache.entity";

const isProduction = env.NODE_ENV === "production";

export const AppDataSource = new DataSource(
  isProduction
    ? {
        type: "postgres",
        url: env.DATABASE_URL,
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        entities: [UserEntity, QuoteCacheEntity],
        synchronize: env.DB_SYNC ?? false,
      }
    : {
        type: "sqlite",
        database: "dev.sqlite",
        entities: [UserEntity, QuoteCacheEntity],
        synchronize: true,
      }
);
