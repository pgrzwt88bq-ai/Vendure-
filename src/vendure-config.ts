import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
    ChannelService,
    Logger,
    TaxCategoryService,
    ZoneService,
    RequestContext,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';

export const config: VendureConfig = {
    apiOptions: {
        port: Number(process.env.PORT) || 3000,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        cors: true,
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
        synchronize: true,
        url: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production'? { rejectUnauthorized: false } : false,
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    plugins: [
        // PLUGIN AUTO-REPAIR: Recrée channel/taxe/zone si supprimés
        {
            init: async (injector) => {
                const channelService = injector.get(ChannelService);
                const taxCategoryService = injector.get(TaxCategoryService);
                const zoneService = injector.get(ZoneService);
                const ctx = new RequestContext({
                    apiType: 'admin',
                    isAuthorized: true,
                    authorizedAsOwnerOnly: false,
                    channel: { id: 1 } as any,
                });

                const channels = await channelService.findAll();
                if (channels.items.length === 0) {
                    await channelService.create({
                        code: '__default_channel__',
                        token: 'default-token',
                        defaultLanguageCode: 'fr',
                        currencyCode: 'XOF',
                    });
                    Logger.info('Default channel recreated KING 👑');
                }

                const taxCategories = await taxCategoryService.findAll(ctx);
                if (taxCategories.length === 0) {
                    await taxCategoryService.create(ctx, { name: 'Standard Tax' });
                    Logger.info('Default tax category recreated KING 👑');
                }

                const zones = await zoneService.findAll(ctx);
                if (zones.length === 0) {
                    await zoneService.create(ctx, { name: 'World' });
                    Logger.info('Default zone recreated KING 👑');
                }
            },
        },
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
            from: 'noreply@king.com',
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: Number(process.env.PORT) || 3000,
        }),
    ],
};
