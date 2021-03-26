/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 00:44:34
 * @LastEditors: ider
 * @LastEditTime: 2021-03-27 01:51:17
 * @Description: 钉钉webhook通知 hook
 */

import axios from 'axios'
import crypto from 'crypto'
import { Appender } from './index.d'

function dingbotAppender(config: Appender, layout: Function) {
  const sendInterval = config.sendInterval * 1000 || 0
  const shutdownTimeout =
    ('shutdownTimeout' in config ? config.shutdownTimeout : 5) * 1000
  const logEventBuffer = []

  let unsentCount = 0
  let sendTimer

  function sendBuffer() {
    if (logEventBuffer.length > 0) {
      let body = ''
      while (logEventBuffer.length > 0) {
        body += `${layout(logEventBuffer.shift())}\n`
      }
      const data = {
        msgtype: 'text',
        text: {
          content: body,
        },
      }
      const params: {
        access_token: string
        sign?: string
        timestamp?: number
      } = {
        access_token: config.access_token,
      }
      if (config.secret != null) {
        const timestamp = Date.now()
        params.sign = crypto
          .createHmac('sha256', config.secret)
          .update(`${timestamp}\n${config.secret}`)
          .digest('base64')
        params.timestamp = timestamp
      }

      axios
        .post(`https://oapi.dingtalk.com/robot/send`, data, {
          params,
        })
        .then(response => {
          if (response.data?.errcode !== 0) {
            console.error(
              'log4js:dingbot - Error sending log to dingbot: ',
              response.data,
            )
          }
        })
        .catch(err => {
          console.error('log4js:dingbot - Error sending log to dingbot: ', err)
        })
    }
  }

  function scheduleSend() {
    if (!sendTimer) {
      sendTimer = setTimeout(() => {
        sendTimer = null
        sendBuffer()
      }, sendInterval)
    }
  }

  function shutdown(cb) {
    if (sendTimer) {
      clearTimeout(sendTimer)
    }

    sendBuffer()

    let timeout = shutdownTimeout
    ;(function checkDone() {
      if (unsentCount > 0 && timeout >= 0) {
        timeout -= 100
        setTimeout(checkDone, 100)
      } else {
        cb()
      }
    })()
  }

  const appender = loggingEvent => {
    unsentCount += 1
    logEventBuffer.push(loggingEvent)
    if (sendInterval > 0) {
      scheduleSend()
    } else {
      sendBuffer()
    }
  }

  appender.shutdown = shutdown

  return appender
}

function configure(config, layouts) {
  let layout = layouts.basicLayout
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout)
  }
  return dingbotAppender(config, layout)
}

export { configure }