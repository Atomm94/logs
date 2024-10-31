import { Database } from '../../../component/db'

export class UserLog {
    public static base_name = 'user_log'
    public static table_structure = `
            date DateTime DEFAULT now(),
            account String,
            account_name String,
            event Enum('create' = 1, 'change' = 2, 'delete' = 3, 'login' = 4, 'logout' = 5),
            target String,
            value String,
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
                            account,
                            account_name,
                            event,
                            target,
                            value,
                            company
                        )
                VALUES (
                    '${JSON.stringify(data.account).replace(/\\/g, '\\\\')}',
                    '${data.account_name}',
                    '${data.event}',
                    '${data.target}',
                    '${JSON.stringify(data.value).replace(/\\/g, '\\\\')}',
                    ${data.company}
                )
        `)
    }

    public static async getLogs (data: any) {
        const table_name = `${this.base_name}_${data.company}`
        let query = ` SELECT * FROM ${table_name} `

        const where = []
        if (data.start_from) {
            if (!data.start_from.includes(':')) data.start_from += ' 00:00:00'
            where.push("date >= '" + data.start_from + "'")
        }
        if (data.start_to) {
            if (!data.start_to.includes(':')) data.start_to += ' 23:59:59'
            where.push("date <= '" + data.start_to + "'")
        }

        if (where.length) {
            query += ` WHERE ${where.join(' AND ')} `
        }

        query += ' ORDER BY date DESC '

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
    }
}
