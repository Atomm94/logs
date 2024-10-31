import {
} from '../controller'
import UserLogController from '../controller/UserLogController'
import EventLogController from '../controller/EventLogController'

import Router from 'koa-router'
import swaggerSpec from '../../component/swagger'

const swaggerUi = require('swagger-ui-koa')

const router = new Router()

export default router
  .get('/', swaggerUi.setup(swaggerSpec))
  .get('swagger', swaggerUi.setup(swaggerSpec))
  .post('userLogTable', UserLogController.addTable)
  .post('userLog', UserLogController.createLog)
  .get('userLog', UserLogController.getLogs)
  .post('eventLogTable', EventLogController.addTable)
  .post('eventLog', EventLogController.createLog)
  .get('eventLog', EventLogController.getLogs)
  .get('eventStatistic', EventLogController.getEventStatistic)
