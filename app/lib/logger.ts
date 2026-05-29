import { getLogger, setupLoggerSync } from 'logtape-easy'
import { APP_TITLE } from './constants'

setupLoggerSync()
const logger = getLogger(APP_TITLE)

export { logger }
