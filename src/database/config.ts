import { DataSource, DataSourceOptions } from 'typeorm';
import getEnvConfig, { ENVIRONMENT } from '../config/env';

export function getConnectionOptions(envConfig: ENVIRONMENT['DB']) {
  const commonConfig = {
    type: envConfig.DIALECT,
    logging: envConfig.LOGGING ?? true,
    migrations: ['dist/database/migrations/*.js'],
    entities: ['dist/**/*.entity.js'],
    migrationsRun: false,
    autoLoadEntities: true,
  }

  // If DB_URL is provided, then connect with that.
  // Otherwise, use the other environment variables.
  if (envConfig.HAS_URL) {
    return {
      ...commonConfig,
      type: envConfig.DIALECT,
      url: envConfig.URL,
    } as DataSourceOptions;
  }

  const configWithoutUrl = envConfig as unknown as ENVIRONMENT['DB'] & {
    HAS_URL: false;
  };

  return {
    host: configWithoutUrl.HOST,
    port: configWithoutUrl.PORT,
    username: configWithoutUrl.USER,
    password: configWithoutUrl.PASSWORD,
    database: configWithoutUrl.NAME,
    ...commonConfig
  } as DataSourceOptions;
}

const options = getConnectionOptions(getEnvConfig()['DB']);

// We define the datasource instance here
// outside of NestJS module system, so the TypeORM CLI can import it.
export const datasource = new DataSource(options);
