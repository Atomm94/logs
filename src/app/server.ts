import app from './app'
import config from '../config'
import { Database } from '../component/db'
import MQTTBroker from './mqtt/mqtt'

// const database = new Database();
// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
(async () => {
    try {
        await Database.connect()
        await MQTTBroker.init()
        app.listen(
            config.server.port, () => console.log('APP listening at port %d', config.server.port)
        )

        process.on('SIGINT', async () => {
            try {
                process.exit(0)
            } catch (e) {
                process.exit(1)
            }
        })
    } catch (e) { console.error('Error:', e) }
})()
