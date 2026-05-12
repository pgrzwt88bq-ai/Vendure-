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
    Injector,
    VendurePlugin,
    PluginCommonModule,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';

// PLUGIN CUSTOM POUR AUTO-REPAIR
@VendurePlugin({
    imports: [PluginCommonModule],
})
export class AutoRepairPlugin {
    constructor(private channelService: ChannelService,
                private taxCategoryService: TaxCategoryService,
                private zoneService: ZoneService) {}

    static init() {
        return new AutoRepairPlugin({} as any, {} as any, {} as any);
    }

    async onApplicationBootstrap(injector: Injector) {
        const channelService = injector.get(ChannelService);
        const taxCategoryService = injector.get(TaxCategoryService);
        const zoneService = injector.get(ZoneService);

        const ctx = RequestContext.empty();

        // 1. Channel par défaut
        const channels = await channelService.findAll(ctx);
        if (channels.items.length === 0) {
            await channelService.create(ctx, {
                code: '__default_channel__',
                token: 'default-token',
                defaultLanguageCode: 'fr',
                currencyCode: 'XOF',
                pricesIncludeTax: false,
            });
            Logger.info('Default channel recreated KING 👑', 'AutoRepairPlugin');
        }

        // 2. TaxCategory par défaut
        const taxCategories = await taxCategoryService.findAll(ctx);
        if (taxCategories.length === 0) {
            await taxCategoryService.create(ctx, { name: 'Standard Tax' });
            Logger.info('Default tax category recreated KING 👑', 'AutoRepairPlugin');
        }

        // 3. Zone par défaut
        const zones = await zoneService.findAll(ctx);
        if (zones.length === 0) {
            await zoneService.create(ctx, { name: 'World' });
            Logger.info('Default zone recreated KING 👑', 'AutoRepairPlugin');
        }
    }
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
        AutoRepairPlugin, // PLUGIN AUTO-REPAIR ICI
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ indexStockStatus: true }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // port supprimé: AssetServerOptions n'a pas de port
        }),
        EmailPlugin.init({
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            // from supprimé: EmailPluginOptions n'a pas de from
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: Number(process.env.PORT) || 3000,
        }),
    ],
};
