import MQTTBroker from './mqtt'
import { ReceiveTopics } from './Topics'
import Parse from './Parse'
// import { OperatorType } from '../mqtt/Operators'

export default class MessageHandler {
    constructor () {
        MQTTBroker.getMessage((topic: ReceiveTopics, message: string) => {
            switch (topic) {
                case ReceiveTopics.MQTT_LOG:
                    Parse.logData(topic, message)
                    break
                default:
                    break
            }
        })
    }
}
