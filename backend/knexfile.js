import knex from 'knex';

// Read only user
export const readOnly = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'readOnlyUser',
    password: 'readOnly',
    database: 'rentals',
    decimalNumbers: true,
    dateStrings: true
  },
});

// Read and write only user
export const readWriteOnly = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'readWriteUser',
    password: 'readWrite',
    database: 'rentals'
  },
});

// Admin user
export const admin = knex({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'admin',
    password: 'admin',
    database: 'rentals'
  },
});