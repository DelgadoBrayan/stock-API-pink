import "reflect-metadata";
import { app } from "./app";
import { AppDataSource } from "./config/database";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.PORT}`);
  });
}

void bootstrap();
