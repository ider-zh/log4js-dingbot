# 钉钉 log4js appender

## usage

```
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