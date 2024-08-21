import { z } from 'zod';
import 'dotenv/config';

const configWithDBUrl = z.object({
  PORT: z.string(),
  DB: z.object({
    DIALECT: z.enum(['postgres', 'mysql', 'mariadb', 'sqlite', 'mssql']),
    URL: z.string().url(),
    HAS_URL: z.literal(true),
    LOGGING: z.boolean(),
  }),
  SALT_ROUNDS: z.string(),
  SECRET: z.string(),
});

const configWithoutDBUrl = z.object({
  PORT: z.string(),
  DB: z.object({
    NAME: z.string(),
    USER: z.string(),
    PASSWORD: z.string(),
    HOST: z.string(),
    PORT: z.coerce.number(),
    HAS_URL: z.literal(false),
    DIALECT: z.enum(['postgres', 'mysql', 'mariadb', 'sqlite', 'mssql']),
    LOGGING: z.boolean(),
  }),
  SALT_ROUNDS: z.string(),
  SECRET: z.string(),
});

const configSchema = z.union([configWithDBUrl, configWithoutDBUrl]);

export default () => {
  const validated = configSchema.parse({
    PORT: process.env.PORT,
    DB: {
      URL: process.env.DB_URL,
      NAME: process.env.DB_NAME ?? 'db-name',
      USER: process.env.DB_USER ?? 'db-user',
      PASSWORD: process.env.DB_PASSWORD ?? 'root',
      HOST: process.env.DB_HOST ?? 'db-host',
      PORT: process.env.DB_PORT ?? 5432,
      HAS_URL: !!process.env.DB_URL,
      DIALECT: process.env.DB_DIALECT ?? 'db-dialect',
      LOGGING: process.env.DB_LOGGING === 'true',
    },
    SALT_ROUNDS: process.env.SALT_ROUNDS ?? '10',
    SECRET: process.env.SECRET ?? 'secret',
  });

  return validated;
};

export type ENVIRONMENT = typeof configSchema._output;
