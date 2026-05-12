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
    VendurePlugin,
    PluginCommonModule,
    LanguageCode,
    CurrencyCode,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [],
})
export class AutoRepairPlugin {
    onApplicationBootstrap = async () => {
        const ctx = RequestContext.empty();

        const channelService = new ChannelService();
        const taxCategoryService = new TaxCategoryService();
        const zoneService = new ZoneService();

        // 1. Channel par défaut
        const channels = await channelService.findAll(ctx);
        if (channels.items.length === 0) {
            await channelService.create(ctx, {
                code: '__default_channel__',
                token: 'default-token',
                defaultLanguageCode: LanguageCode.fr,
                currencyCode: CurrencyCode.XOF,
                pricesIncludeTax: false,
            });
            Logger.info('Default channel recreated KING 👑', 'AutoRepairPlugin');
        }

        // 2. TaxCategory par défaut
        const taxCategories = await taxCategoryService.findAll(ctx);
        if (taxCategories.items.length === 0) {
            await taxCategoryService.create(ctx, { name: 'Standard Tax' });
            Logger.info('Default tax category recreated KING 👑', 'AutoRepairPlugin');
        }

        // 3. Zone par défaut
        const zones = await zoneService.findAll(ctx);
        if (zones.items.length === 0) {
            await zoneService.create(ctx, { name: 'World' });
            Logger.info('Default zone recreated KING 👑', 'AutoRepairPlugin');
        }
    };
}

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
        AutoRepairPlugin,
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ indexStockStatus: true }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
        }),
        EmailPlugin.init({
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            transport: {
                type: 'null',
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: Number(process.env.PORT) || 3000,
        }),
    ],
};
