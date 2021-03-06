/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 00:53:05
 * @LastEditors: ider
 * @LastEditTime: 2021-04-06 13:32:29
 * @Description:
 */

export interface DingbotAppender {
  type: 'dingbot'
  // your Dingding API token (see the slack docs)
  access_token: string
  // `string` (optional, defaults to `null`) - your secret, see [robot Webhook api](https://developers.dingtalk.com/document/app/custom-robot-access)
  secret?: string
  // `integer` (optional, defaults to `3`) - batch ding and send in ding every sendInterval seconds, if 0 then every log message will send an ding. see [api ratelimit](https://developers.dingtalk.com/document/app/invocation-frequency-limit)
  sendInterval?: number
  // `integer` (optional, defaults to `3`) - log message long than 19000 bytes will spilt to send every splitSendInterval seconds.
  splitSendInterval?: number
  // (defaults to 5) - time in seconds to wait for emails to be sent during shutdown
  shutdownTimeout?: number
  // (defaults to basicLayout) - the layout to use for the message.
  layout?: Function
}

export type Appender = DingbotAppender
