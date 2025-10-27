// database.module.ts - Fixed for development mode

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { pgOptions } from './config/postgres';

// 1. Determine the correct configuration based on the environment variable
const isSqlite = pgOptions.url?.startsWith('sqlite:');

// 2. Create a single configuration object
const dataSourceOptions: DataSourceOptions = isSqlite
  ? {
      type: 'better-sqlite3',  // CHANGED: Use better-sqlite3 driver
      database: pgOptions.url.replace('sqlite:', ''), // Remove sqlite: prefix
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // CHANGED: Support both .ts and .js
      logging: false, // Set to true for debugging
    }
  : {
      type: 'postgres',
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // CHANGED: Support both .ts and .js
      ...pgOptions,
    };

// 3. LAZY DataSource initialization - only create when actually needed
let dataSourceInstance: DataSource | null = null;

export const getPostgresDataSource = async (): Promise<DataSource> => {
  if (!dataSourceInstance) {
    dataSourceInstance = new DataSource(dataSourceOptions);
    if (!dataSourceInstance.isInitialized) {
      await dataSourceInstance.initialize();
    }
  }
  return dataSourceInstance;
};

// 4. Define and EXPORT the module
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
})
export class PostgresModule {}