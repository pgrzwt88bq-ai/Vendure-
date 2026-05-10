import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import path from 'path';

export const config: VendureConfig = {
    apiOptions: {
        port: 3000,
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
        url: process.env.DATABASE_URL,
        synchronize: true,
        ssl: {
            rejectUnauthorized: false,
        },
    } as PostgresConnectionOptions,
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
        }),
        DefaultJobQueuePlugin.init(),
        DefaultSearchPlugin.init(),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: 3002,
        }),
    ],
};
