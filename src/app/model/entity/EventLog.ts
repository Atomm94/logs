import { Database } from '../../../component/db'

export class EventLog {
    public static base_name = 'event_log'
    public static table_structure = `
            created_at DateTime64 DEFAULT now(),
            date DateTime64 DEFAULT now(),
            event_type Enum8('SYSTEM' = 0, 'SYSTEM-ALARM' = 1, 'CARDHOLDER' = 2, 'CARDHOLDER-ALARM' = 3, 'USER' = 4),
            cardholder Nullable(String),
            cardholder_id Nullable(Int64),
            credential Nullable(String),
            access_right Nullable(String),
            access_point Nullable(String),
            access_point_id Nullable(Int64),
            event_source Nullable(String),
            event Nullable(String),
            event_id Nullable(Int64),
            result Nullable(String),
            direction Enum8('NONE' = -1, 'ENTRY' = 0, 'EXIT' = 1) DEFAULT -1,
            company Int64
    `
    public static table_engine = 'MergeTree'
    public static async createTable (company: number) {
        const table_name = `${this.base_name}_${company}`
        const queries = [
            `
                CREATE TABLE IF NOT EXISTS ${table_name} ( ${this.table_structure} )
                ENGINE = ${this.table_engine}
                ORDER BY tuple()
            `
        ]

        for (const query of queries) {
            await Database.query(query)
        }
        return true
    }

    public static async createLog (data: any) {
        const table_name = `${this.base_name}_${data.company}`
        return await Database.query(`INSERT INTO ${table_name}
            ( 
                date,
                event_type,
                cardholder,
                cardholder_id,
                credential,
                access_right,
                access_point,
                access_point_id,
                event_source,
                event,
                event_id,
                result,
                direction,
                company
            )
            VALUES (
                ${data.date ? "'" + data.date + "'" : null},
                ${data.event_type ? "'" + data.event_type + "'" : null},
                ${data.cardholder ? "'" + JSON.stringify(data.cardholder).replace(/\\/g, '\\\\') + "'" : null},
                ${data.cardholder_id ? "'" + data.cardholder_id + "'" : null},
                ${data.credential ? "'" + JSON.stringify(data.credential).replace(/\\/g, '\\\\') + "'" : null},
                ${data.access_right ? "'" + JSON.stringify(data.access_right).replace(/\\/g, '\\\\') + "'" : null},
                ${data.access_points ? "'" + JSON.stringify(data.access_points).replace(/\\/g, '\\\\') + "'" : null},
                ${data.access_point ? "'" + data.access_point + "'" : null},
                ${data.event_source ? "'" + data.event_source + "'" : null},
                ${data.event ? "'" + data.event + "'" : null},
                ${data.event_id ? "'" + data.event_id + "'" : null},
                ${data.result ? "'" + data.result + "'" : null},
                ${('direction' in data) ? Number(data.direction) : -1},
                ${data.company ? "'" + Number(data.company) + "'" : null}
                )
        `)
    }

    public static async getLogs (data: any) {
        try {
            const table_name = `${this.base_name}_${data.company}`
            let access_points = data.access_points ? JSON.parse(data.access_points) : null
            let cardholders = data.cardholders ? JSON.parse(data.cardholders) : null
            let events = data.events ? JSON.parse(data.events) : null

            if (access_points && !Array.isArray(access_points)) access_points = Object.values(access_points)
            if (cardholders && !Array.isArray(cardholders)) cardholders = Object.values(cardholders)
            if (events && !Array.isArray(events)) events = Object.values(events)

            let query = ` SELECT * FROM ${table_name} `

            const where = []
            if (data.start_from) {
                if (!data.start_from.includes(':')) data.start_from += ' 00:00:00'
                where.push("date > '" + data.start_from + "'")
            }
            if (data.start_to) {
                if (!data.start_to.includes(':')) data.start_to += ' 23:59:59'
                where.push("date < '" + data.start_to + "'")
            }
            if (access_points) {
                where.push(`access_point_id IN (${access_points.join(',')})`)
            }
            if (cardholders) {
                where.push(`cardholder_id IN (${cardholders.join(',')})`)
            }
            if (events) {
                where.push(`event_id IN (${events.join(',')})`)
            }

            if (where.length) {
                query += ` WHERE ${where.join(' AND ')} `
            }

            query += ' ORDER BY created_at DESC '

            if (!data.page) data.page = 1
            const limit = data.page_items_count ? data.page_items_count : 500

            let limit_value = limit

            let data_count
            if (data.resource_limit && data.page * limit > data.resource_limit) {
                limit_value = data.resource_limit - (data.page - 1) * limit
                if (limit_value < 0) limit_value = 0
                data_count = data.resource_limit
            }

            query += ` LIMIT ${limit_value} `
            if (data.page) {
                query += ` OFFSET ${(data.page - 1) * limit} `
            }

            const logs = await Database.query(query)

            if (data.page) {
                const total = await Database.query(`SELECT COUNT(date) AS count FROM ${table_name} WHERE ${where.length ? where.join(' AND ') : 1}`)
                // if (!data_count) {
                if (data.resource_limit && total[0].count > data.resource_limit) {
                    data_count = data.resource_limit
                } else {
                    data_count = total[0].count
                }
                // }
                return {
                    data: logs,
                    count: data_count
                }
            } else {
                return logs
            }
        } catch (error) {
            console.log(444, error)
            return []
        }
    }

    public static async getEventStatistic (data: any) {
        const table_name = `${this.base_name}_${data.company}`
        let query
        if (data.resource_limit) {
            query = `
            SELECT a.event_type, COUNT(a.event_type) AS event_qty FROM 
                    (SELECT event_type FROM ${table_name} LIMIT ${data.resource_limit}) a
            GROUP BY a.event_type 
            `
        } else {
            query = `
            SELECT event_type, COUNT(${table_name}.event_type) AS event_qty FROM ${table_name}
            GROUP BY event_type 
            `
        }
        return await Database.query(query)
    }
}
