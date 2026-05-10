import { VendureConfig } from '@vendure/core';

export const config: VendureConfig = {
  apiOptions: {
    port: process.env.PORT || 3000,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
  },
  authOptions: {
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME || 'admin',
      password: process.env.SUPERADMIN_PASSWORD || 'king1234',
    },
  },
  dbConnectionOptions: {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
  },
};
