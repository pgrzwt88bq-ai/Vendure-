import { EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { DefaultJobQueuePlugin, VendureConfig } from '@vendure/core';
import path from 'path';

export const config: VendureConfig = {
    apiOptions: {
        port: Number(process.env.PORT) || 3000,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: 'superadmin',
            password: 'superadmin',
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        synchronize: true,
        logging: false,
        url: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    },
    paymentOptions: {
        paymentMethodHandlers: [],
    },
    customFields: {},
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        
        EmailPlugin.init({
            transport: { type: 'none' },
        }),
        
        AdminUiPlugin.init({
            route: 'admin',
            port: Number(process.env.PORT) || 3000,
        }),
    ],
};
