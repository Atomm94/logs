import lodash from 'lodash'
import { OperatorType } from './Operators'
import {
    IEventLogMessaging,
    IEventsLogsMessaging,
    ILogMessaging,
    IUserLogMessaging
} from '../interfaces/messaging.interface'
import { EventLog } from '../model/entity/EventLog'
import { UserLog } from '../model/entity/UserLog'

export default class Parse {
    public static logData (topic: string, data: string) {
        const message: ILogMessaging = JSON.parse(data)
        switch (message.operator) {
            case OperatorType.EVENT_LOG:
                this.saveEventLog(message as IEventLogMessaging)
                break
            case OperatorType.GET_EVENTS_LOGS:
                this.saveEventsLogs(message as IEventsLogsMessaging)
                break
            case OperatorType.USER_LOG:
                this.saveUserLog(message as IUserLogMessaging)
                break
            default:
                break
        }
    }

    public static async saveEventLog (message: IEventLogMessaging) {
        try {
            try {
                await EventLog.createLog(message.data)
            } catch (error) {
                if (error.code && error.code === 60) {
                    await EventLog.createTable(+message.data.company)
                    await EventLog.createLog(message.data)
                } else {
                    console.log('Event log create Error', error)
                }
            }
        } catch (error) {
            console.log('Event log create Error', error)
        }
    }

    public static async saveEventsLogs (message: IEventsLogsMessaging) {
        try {
            const promises: any = []
            const insertInterval = 10
            lodash.chunk(message.events, insertInterval).map(events => events.map(async event => {
                try {
                    return EventLog.createLog(event)
                } catch (error) {
                    if (error.code && error.code === 60) {
                        promises.push(EventLog.createTable(+event.company))
                        promises.push(EventLog.createLog(event))

                        return promises
                    } else {
                        console.log('Event log create Error', error)
                    }
                }
            }))
        } catch (error) {
            console.log('Event log create Error', error)
        }
    }

    public static async saveUserLog (message: IUserLogMessaging) {
        try {
            try {
                await UserLog.createLog(message.data)
            } catch (error) {
                if (error.code && error.code === 60) {
                    await UserLog.createTable(+message.data.company)
                    await UserLog.createLog(message.data)
                } else {
                    console.log('User log create Error', error)
                }
            }
        } catch (error) {
            console.log('User log create Error', error)
        }
    }
}
