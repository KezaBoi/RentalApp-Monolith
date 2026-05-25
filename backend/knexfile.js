import knex from 'knex';
import 'dotenv/config';

// READ ONLY USER
export const readOnly = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_READ_HOST || '127.0.0.1',
    user: process.env.DB_READ_USER || 'readOnlyUser',
    password: process.env.DB_READ_PASSWORD || 'readOnly',
    database: process.env.DB_NAME || 'rentals',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    decimalNumbers: true,
    dateStrings: true
  },
});

// READ AND WRITE USER
export const readWriteOnly = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_WRITE_HOST || '127.0.0.1',
    user: process.env.DB_WRITE_USER || 'readWriteUser',
    password: process.env.DB_WRITE_PASSWORD || 'readWrite',
    database: process.env.DB_NAME || 'rentals',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  },
});

// ADMIN USER
export const admin = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_ADMIN_HOST || '127.0.0.1',
    user: process.env.DB_ADMIN_USER || 'admin',
    password: process.env.DB_ADMIN_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'rentals',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  },
});
