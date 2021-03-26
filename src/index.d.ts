/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 00:53:05
 * @LastEditors: ider
 * @LastEditTime: 2021-03-27 00:42:21
 * @Description:
 */

export interface DingbotAppender {
  type: 'dingbot'
  // your Dingding API token (see the slack docs)
  access_token: string
  // secret of dingding apicd
  secret?: string
  // integer(defaults to 0) - batch emails and send in one email every sendInterval seconds, if 0 then every log message will send an email.
  sendInterval?: number

  // (defaults to 5) - time in seconds to wait for emails to be sent during shutdown
  shutdownTimeout?: number
  // (defaults to basicLayout) - the layout to use for the message.
  layout?: Function
}

export type Appender = DingbotAppender
