import { DefaultContext } from 'koa'
import { EventLog } from '../model/entity/EventLog'

export default class EventLogController {
    /**
     *
     * @swagger
     *  /eventLogTable:
     *      post:
     *          tags:
     *              - EventLog
     *          summary: Create a table for company.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: body
     *              name: create event log table
     *              description: The table to create.
     *              schema:
     *                type: object
     *                required:
     *                  - company
     *                properties:
     *                    company:
     *                        type: number
     *                        example: 1
     *          responses:
     *              '201':
     *                  description: A create table for company
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async addTable (ctx: DefaultContext) {
        try {
            ctx.body = await EventLog.createTable(ctx.request.body.company)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /eventLog:
     *      post:
     *          tags:
     *              - EventLog
     *          summary: Create an user log.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: body
     *              name: create user log
     *              description: The log to create.
     *              schema:
     *                type: object
     *                required:
     *                  - event_type
     *                  - entry
     *                  - entry_name
     *                  - event
     *                  - company
     *                properties:
     *                    event_type:
     *                        type: cardholder | alarm | system
     *                        example: cardholder
     *                    cardholder:
     *                        type: number
     *                        example: 1
     *                    cardholder_name:
     *                        type: string
     *                        example: Johny Sanches Wu
     *                    event_source:
     *                        type: string
     *                        example: Hardware
     *                    credential:
     *                        type: number
     *                        example: 1
     *                    credential_name:
     *                        type: string
     *                        example: RFID
     *                    access_right:
     *                        type: number
     *                        example: 1
     *                    access_right_name:
     *                        type: string
     *                        example: Pool clean
     *                    entry:
     *                        type: number
     *                        example: 1
     *                    entry_name:
     *                        type: string
     *                        example: Main door32.Entry Reader
     *                    event:
     *                        type: unlock | lock | device_restart
     *                        example: unlock
     *                    result:
     *                        type: string
     *                        example: Access granted
     *                    company:
     *                        type: number
     *                        example: 1
     *
     *          responses:
     *              '201':
     *                  description: A create user log
     *              '409':
     *                  description: Conflict
     *              '422':
     *                  description: Wrong data
     */
    public static async createLog (ctx: DefaultContext) {
        try {
            ctx.body = await EventLog.createLog(ctx.request.body)
        } catch (error) {
            if (error.code && error.code === 60) {
                await EventLog.createTable(ctx.request.body.company)
                ctx.body = await EventLog.createLog(ctx.request.body)
            } else {
                ctx.status = error.status || 400
                ctx.body = error
            }
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /eventLog:
     *      get:
     *          tags:
     *              - EventLog
     *          summary: Return user logs
     *          parameters:
     *              - in: query
     *                name: company
     *                required: true
     *                description: company id
     *                schema:
     *                    type: number
     *              - in: query
     *                name: limit
     *                required: true
     *                description: company logs limit
     *                schema:
     *                    type: number
     *          responses:
     *              '200':
     *                  description: Array of user logs
     *              '401':
     *                  description: Unauthorized
     */
    public static async getLogs (ctx: DefaultContext) {
        try {
            ctx.body = await EventLog.getLogs(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     * /eventStatistic:
     *      get:
     *          tags:
     *              - EventLog
     *          summary: Return user logs
     *          parameters:
     *              - in: query
     *                name: company
     *                required: true
     *                description: company id
     *                schema:
     *                    type: number
     *              - in: query
     *                name: limit
     *                required: true
     *                description: company logs limit
     *                schema:
     *                    type: number
     *          responses:
     *              '200':
     *                  description: Array of user logs
     *              '401':
     *                  description: Unauthorized
     */
    public static async getEventStatistic (ctx: DefaultContext) {
        try {
            const logs = await EventLog.getLogs(ctx.query)
            const events_statistic = await EventLog.getEventStatistic(ctx.query)
            const send_data = {
                logs: logs,
                events_statistic: events_statistic
            }
            ctx.body = send_data
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
