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
})
export class AutoRepairPlugin {
    constructor(
        private channelService: ChannelService,
        private taxCategoryService: TaxCategoryService,
        private zoneService: ZoneService,
    ) {}

    // Pas d'interface OnApplicationBootstrap - juste la méthode
    async onApplicationBootstrap() {
        const ctx = RequestContext.empty();

        // 1. Zone par défaut D'ABORD
        let defaultZone;
        const zones = await this.zoneService.findAll(ctx);
        if (zones.items.length === 0) {
            defaultZone = await this.zoneService.create(ctx, { name: 'World' });
            Logger.info('Default zone recreated KING 👑', 'AutoRepairPlugin');
        } else {
            defaultZone = zones.items[0];
        }

        // 2. TaxCategory par défaut
        let defaultTaxCategory;
        const taxCategories = await this.taxCategoryService.findAll(ctx);
        if (taxCategories.items.length === 0) {
            defaultTaxCategory = await this.taxCategoryService.create(ctx, { name: 'Standard Tax' });
            Logger.info('Default tax category recreated KING 👑', 'AutoRepairPlugin');
        } else {
            defaultTaxCategory = taxCategories.items[0];
        }

        // 3. CANAL BERTHO PAR DÉFAUT
        const channels = await this.channelService.findAll(ctx);
        if (channels.items.length === 0) {
            await this.channelService.create(ctx, {
                code: 'bertho',
                token: 'bertho-token',
                defaultLanguageCode: LanguageCode.fr,
                currencyCode: CurrencyCode.XOF,
                pricesIncludeTax: false,
                defaultTaxZoneId: defaultZone.id,
                defaultShippingZoneId: defaultZone.id,
            });
            Logger.info('Canal Bertho recréé KING 👑', 'AutoRepairPlugin');
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
                type: 'testing',
                onSend: () => {}, // Fix erreur TS2322
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: Number(process.env.PORT) || 3000,
        }),
    ],
};
