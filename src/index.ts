/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 00:44:34
 * @LastEditors: ider
 * @LastEditTime: 2021-04-06 13:06:47
 * @Description: 钉钉webhook通知 hook
 */

import axios from 'axios'
import crypto from 'crypto'
import { Appender } from './index.d'

function dingbotAppender(config: Appender, layout: Function) {
  // 超长日志的连续发送间隔，以 20/min 为参考
  const splitSendInterval =
    ('splitSendInterval' in config ? config.splitSendInterval : 3) * 1000
  // 发送间隔
  const sendInterval =
    ('sendInterval' in config ? config.sendInterval : 3) * 1000
  // 关闭前检查
  const shutdownTimeout =
    ('shutdownTimeout' in config ? config.shutdownTimeout : 5) * 1000
  const logEventBuffer = []
  // 长日子切割缓存
  let logLongLineTmp = ''
  let unsentCount = 0
  let sendTimer: NodeJS.Timeout

  function sendBuffer() {
    let body = ''
    let sentCount = 0
    // 缓存发送
    if (logLongLineTmp.length > 0) {
      if (logLongLineTmp.length > 6000) {
        body = logLongLineTmp.slice(0, 6000)
        logLongLineTmp = logLongLineTmp.slice(6000, -1)
        scheduleSend(splitSendInterval)
      } else {
        body = logLongLineTmp
        logLongLineTmp = ''
        // 安排发送事件中的日志
        scheduleSend()
      }
      sendDing(body, config)
    } else if (logEventBuffer.length > 0) {
      let messageLength = 0
      while (logEventBuffer.length > 0) {
        const currentLine = `${layout(logEventBuffer[0])}\n`
        // 判断是否超长,限制长度为 20000，超长就分布发送
        messageLength += new TextEncoder().encode(currentLine).length
        if (body.length > 0 && messageLength > 19000) {
          scheduleSend(splitSendInterval)
          break
        } else if (messageLength > 19000) {
          // 单条超过长度的,按照 6000 切割
          logEventBuffer.shift()
          logLongLineTmp = currentLine
          sendBuffer()
          return
        }
        logEventBuffer.shift()
        sentCount += 1
        body += currentLine
      }
      unsentCount -= sentCount
      sendDing(body, config)
    }
  }

  function scheduleSend(mysendInterval?: number) {
    const _sendInterval = mysendInterval ? mysendInterval : sendInterval
    if (!sendTimer) {
      sendTimer = setTimeout(() => {
        sendTimer = null
        sendBuffer()
      }, _sendInterval)
    }
  }

  function shutdown(cb: Function) {
    if (sendTimer) {
      clearTimeout(sendTimer)
    }
    sendBuffer()
    let timeout = shutdownTimeout
    ;(function checkDone() {
      if (unsentCount > 0 && timeout >= 0 && logLongLineTmp.length === 0) {
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

function sendDing(body: string, config: Appender) {
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

export { configure }
