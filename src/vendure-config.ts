import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const PORT = Number(process.env.PORT) || 3000;

export const config: VendureConfig = {
    apiOptions: {
        port: PORT,
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
        DefaultJobQueuePlugin.init({}),
        DefaultSearchPlugin.init({}),
        AdminUiPlugin.init({
            route: 'admin',
            port: PORT,
        }),
    ],
};
