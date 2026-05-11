import {
    dummyEmailHandler,
    EmailPlugin,
} from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { DefaultJobQueuePlugin } from '@vendure/job-queue-plugin';
import { VendureConfig } from '@vendure/core';
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
        synchronize: true, // Mets false en prod plus tard
        logging: false,
        url: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false, // OBLIGATOIRE pour Render
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
            port: Number(process.env.PORT) || 3000,
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        
        // EMAIL PLUGIN DÉSACTIVÉ POUR FIX ENOENT
        EmailPlugin.init({
            handlers: [dummyEmailHandler],
            templatePath: path.join(__dirname, '../static/email/templates'),
            transport: { type: 'none' },
            globalTemplateVars: {
                fromAddress: '"KING SHOP" <noreply@king.com>',
                verifyEmailAddressUrl: 'http://localhost:3000/verify',
                passwordResetUrl: 'http://localhost:3000/reset',
                changeEmailAddressUrl: 'http://localhost:3000/change-email',
            },
        }),
        
        AdminUiPlugin.init({
            route: 'admin',
            port: Number(process.env.PORT) || 3000,
        }),
    ],
};
