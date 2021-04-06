# dingtalk(钉钉) log4js appender

send log to ding bot.

ratelimit is 20/min

## Install
npm
```bash
npm install log4js @ruangnazi/log4js-dingbot
```
yarn
```bash
yarn add log4js @ruangnazi/log4js-dingbot
```

## Configuration

+ `type` - `@ruangnazi/log4js-dingbot`
+ `access_token` - `string` - your access_token
+ `secret` - `string` (optional, defaults to `null`) - your secret, see [robot Webhook api](https://developers.dingtalk.com/document/app/custom-robot-access)
+ `sendInterval` - `integer` (optional, defaults to `3`) - batch ding and send in ding every sendInterval seconds, if 0 then every log message will send an ding. see [api ratelimit](https://developers.dingtalk.com/document/app/invocation-frequency-limit)
+ `splitSendInterval` - `integer` (optional, defaults to `3`) - log message long than 19000 bytes will spilt to send every splitSendInterval seconds.
+ `shutdownTimeout` - `integer` (optional, defaults to `5`) - time in seconds to wait for emails to be sent during shutdown
+ `layout` - `object` (optional, defaults to basicLayout) - see [layouts](layouts.md)

## Example

```javascript
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    dingbot: {
      type: '@ruangnazi/log4js-dingbot',
      access_token: 'access_token',
      secret: 'secret',
      sendInterval: 5
    }
  },
  categories: { default: { appenders: ['out', 'dingbot'], level: 'debug' } }
})

const app = log4js.getLogger()
app.info('测试钉钉')
```