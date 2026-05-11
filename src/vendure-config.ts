import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';

// Render donne le port via process.env.PORT
const PORT = Number(process.env.PORT) || 3000;
// Render donne l'URL publique du service
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

export const config: VendureConfig = {
    apiOptions: {
        port: PORT,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        // Important pour Render : autorise les CORS
        cors: true,
    },
    authOptions: {
        tokenMethod: 'bearer',
        superadminCredentials: {
            identifier: 'superadmin',
            password: 'superadmin',
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // Render Internal URL = PAS DE SSL
        ssl: false,
        synchronize: true, // Créé les tables au premier boot
        logging: false,
        url: process.env.DATABASE_URL,
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {},
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: '/tmp/vendure/assets', // /tmp existe toujours sur Render
            port: PORT,
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ indexStockStatus: false }),
        EmailPlugin.init({
            devMode: true,
            outputPath: '/tmp/vendure/email-output',
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            globalTemplateVars: {
                fromAddress: '"Vendure" <noreply@vendure.io>',
                verifyEmailAddressUrl: `${PUBLIC_URL}/verify`,
                passwordResetUrl: `${PUBLIC_URL}/password-reset`,
                changeEmailAddressUrl: `${PUBLIC_URL}/verify-email-address-change`,
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: PORT,
        }),
    ],
};
