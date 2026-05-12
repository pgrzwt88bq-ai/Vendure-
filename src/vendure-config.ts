import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
    ChannelService,
    Logger,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { MultivendorPlugin } from '@vendure/multivendor-plugin';
import path from 'path';

export const config: VendureConfig = {
    apiOptions: {
        port: Number(process.env.PORT) || 3000,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        cors: {
            origin: true,
            credentials: true,
        },
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME || 'superadmin',
            password: process.env.SUPERADMIN_PASSWORD || 'superadmin',
        },
        cookieOptions: {
            secret: process.env.COOKIE_SECRET || 'cookie-secret',
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        synchronize: true, // À désactiver en prod
        logging: false,
        url: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production'? { rejectUnauthorized: false } : false,
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    plugins: [
        // AUTO-CREATE DEFAULT CHANNEL SI IL EXISTE PAS
        {
            init: async (injector) => {
                const channelService = injector.get(ChannelService);
                const channels = await channelService.findAll();
                if (channels.items.length === 0) {
                    await channelService.create({
                        code: '__default_channel__',
                        token: 'default-token',
                        defaultLanguageCode: 'fr',
                        currencyCode: 'XOF',
                    });
                    Logger.info('Default channel auto-created KING 👑');
                }
            },
        },
        MultivendorPlugin.init({
            platformFeePercent: 10,
            platformFeeSKU: 'PLATFORM_FEE',
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ indexStockStatus: true }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            port: Number(process.env.PORT) || 3000,
        }),
        EmailPlugin.init({
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            transport: {
                type: 'smtp',
                host: 'smtp.example.com',
                port: 587,
                auth: {
                    user: 'username',
                    pass: 'password',
                },
            },
            from: 'noreply@king.com',
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: Number(process.env.PORT) || 3000,
        }),
    ],
};
