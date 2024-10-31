import { OperatorType } from '../mqtt/Operators'

export interface ICrudMqttMessaging {
    operator: OperatorType
    topic: string
    message_id: string
    session_id: string
    update: boolean
    data: any
}

export interface IDeviceMqttMessaging {
    operator: OperatorType,
    message_id: string,
    session_id: string,
    info: any,
    result: {
        errorNo: number,
        description?: string
        time: number,
    }
}

export interface IMqttCrudMessaging extends IDeviceMqttMessaging {
    device_topic: string,
    location: string,
    company: number,
    device_id: number,
    send_data: ICrudMqttMessaging
}

export interface ILogMessaging {
    operator: OperatorType,
}
export interface IEventLogMessaging extends ILogMessaging {
    data: {
        credential: { [key: string]: any },
        cardholder: { [key: string]: any },
        access_right: { [key: string]: any },
        ctp: string,
        date: number,
        company: number

    }
}

export interface IEventsLogsMessaging extends ILogMessaging {
    events: {
        credential: { [key: string]: any },
        cardholder: { [key: string]: any },
        access_right: { [key: string]: any },
        ctp: string,
        date: number,
        company: number
    }[]
}

export interface IUserLogMessaging extends ILogMessaging {
    data: {
        account: { [key: string]: any },
        account_name: string,
        event: string,
        target: string,
        value: string | null,
        company: number

    }
}
