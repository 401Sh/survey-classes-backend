import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dbPortNumber = process.env.DB_PORT ? +process.env.DB_PORT : 3306;

export const dataSourceOptions: DataSourceOptions = {
    type: "mysql",
    host: process.env.DB_HOST,
    port: dbPortNumber,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity.js'],
    // migrations: ['dist/src/database/migrations/*.ts'],
    synchronize: false,
    logging: false,
};