import * as dotenv from 'dotenv'
import * as path from 'path'
import _ from 'lodash'
import uuid from 'uuid'

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' })

const allowEnv: string[] = ['development', 'test', 'production']

process.env.NODE_ENV = process.env.NODE_ENV && allowEnv.includes((process.env.NODE_ENV).toLocaleLowerCase())
    ? (process.env.NODE_ENV).toLocaleLowerCase() : 'development'

const ROOT = path.resolve(__dirname, '../')

export interface IConfig {
    server: {
        port: number | boolean,
        root: string
    };
    mqtt: {
        protocol: string,
        host: string,
        port: number | boolean
        username: string,
        password: string,
    };
    db: {
        url: string,
        port: number,
        debug: boolean,
        basicAuth: {
            username: string,
            password: string

        } | null,
        isUseGzip: boolean,
        format: string,
        config: {
            session_id: string,
            session_timeout: number,
            output_format_json_quote_64bit_integers: number,
            enable_http_compression: number,
            database: string,
        },
        reqParams: { [key: string]: string | number | boolean } | null,
    };
    cors: {
        origin: string,
        credentials: boolean
        allowMethods: string[],
        exposeHeaders: string[],
        allowHeaders: string[]
    };
    bodyParser: {
        enableTypes: string[],
        formLimit: string,
        jsonLimit: string
    };
    logger: {
        sentry: {
            dns: string
        }
    };
    sendgrid: {
        fromEmail: string,
        apiKey: string
    };
    nodeEnv: string;
    isTest: boolean;
    isProduction: boolean;
    isDevelopment: boolean;

}

const config: IConfig = {
    server: {
        port: normalizePort(_.defaultTo(process.env.PORT, 3000)),
        root: ROOT
    },
    mqtt: {
        protocol: _.defaultTo(process.env.MQTT_PROTOCOL, 'wxs'),
        host: _.defaultTo(process.env.MQTT_HOST, 'localhost'),
        port: normalizePort(_.defaultTo(process.env.MQTT_PORT, 5432)),
        username: _.defaultTo(process.env.MQTT_USERNAME, 'unimacs'),
        password: _.defaultTo(process.env.MQTT_PASSWORD, '123456')
    },
    db: {
        url: _.defaultTo(process.env.DB_URL, 'http://localhost'),
        port: _.defaultTo(Number(process.env.DB_PORT), 8123),
        debug: _.defaultTo(JSON.parse(process.env.DB_DEBUG as string), false),
        basicAuth: _.defaultTo({
            username: _.defaultTo(process.env.DB_USERNAME, 'default'),
            password: _.defaultTo(process.env.DB_PASSWORD, '')
        }, null),
        isUseGzip: true,
        format: 'json', // "json" || "csv" || "tsv"
        config: {
            session_id: uuid(),
            session_timeout: 60,
            output_format_json_quote_64bit_integers: 0,
            enable_http_compression: 0,
            database: _.defaultTo(process.env.DB_NAME, 'default')
        },
        reqParams: null
    },
    cors: {
        origin: process.env.ORIGIN ? process.env.ORIGIN : 'http://localhost:8080',
        credentials: true,
        allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
        exposeHeaders: ['X-Request-Id'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept']
    },
    bodyParser: {
        enableTypes: ['json', 'form'],
        formLimit: '10mb',
        jsonLimit: '10mb'
    },
    logger: {
        sentry: {
            dns: process.env.SENTRY_DNS as string
        }
    },
    sendgrid: {
        fromEmail: _.defaultTo(process.env.SENDGRID_FROM_EMAIL, 'g.israelyan@studio-one.am'),
        apiKey: _.defaultTo(process.env.SENDGRID_API_KEY, 'empty')
    },
    nodeEnv: process.env.NODE_ENV,
    isTest: !!(process.env.NODE_ENV === 'test' && process.env.NODE_TEST),
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
}

/**
 * Normalize port
 * @param val {string} value port
 */
export function normalizePort (val: string | number): number | boolean {
    const port: number = parseInt(val as string, 10)

    if (isNaN(port)) {
        return port
    }

    if (port >= 0) {
        return port
    }

    return false
}

export default config
