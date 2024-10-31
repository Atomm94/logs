import { DefaultContext } from 'koa'
import { UserLog } from '../model/entity/UserLog'

export default class UserLogController {
    /**
     *
     * @swagger
     *  /userLogTable:
     *      post:
     *          tags:
     *              - UserLog
     *          summary: Create a table for company.
     *          consumes:
     *              - application/json
     *          parameters:
     *            - in: body
     *              name: create user log table
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
            ctx.body = await UserLog.createTable(ctx.request.body.company)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }

    /**
     *
     * @swagger
     *  /userLog:
     *      post:
     *          tags:
     *              - UserLog
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
     *                  - account
     *                  - account_name
     *                  - event
     *                  - target
     *                  - value
     *                  - company
     *                properties:
     *                    account:
     *                        type: number
     *                        example: 1
     *                    account_name:
     *                        type: string
     *                        example: John
     *                    event:
     *                        type: create | change | delete | login | logout
     *                        example: create
     *                    target:
     *                        type: string
     *                        example: Account / username
     *                    value:
     *                        type: string
     *                        example: john777
     *                    company:
     *                        type: number
     *                        example: 1
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
            ctx.body = await UserLog.createLog(ctx.request.body)
        } catch (error) {
            if (error.code && error.code === 60) {
                await UserLog.createTable(ctx.request.body.company)
                ctx.body = await UserLog.createLog(ctx.request.body)
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
     * /userLog:
     *      get:
     *          tags:
     *              - UserLog
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
            ctx.body = await UserLog.getLogs(ctx.query)
        } catch (error) {
            ctx.status = error.status || 400
            ctx.body = error
        }
        return ctx.body
    }
}
