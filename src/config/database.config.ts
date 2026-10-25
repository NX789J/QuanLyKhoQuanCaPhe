import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return {
      type: 'postgres',
      url: connectionString,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Tự động tạo/cập nhật bảng trong môi trường học tập/phát triển
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_DATABASE || 'coffee_inventory_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
  };
};