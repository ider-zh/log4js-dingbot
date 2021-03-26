/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 01:31:08
 * @LastEditors: ider
 * @LastEditTime: 2021-03-27 00:41:22
 * @Description:
 */

import log4js from 'log4js'

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    dingbot: {
      type: './src/index',
      access_token: '68c56f440c4cc6e894f0637b21418e8ab2594fd14a72e8228349c575c91375eb',
      secret: 'SECefecc96347fe11df010a2a1a231d4bd521d891d9b74292d12af027b3ebaf5dcd',
      sendInterval: 5
    }
  },
  categories: { default: { appenders: ['out', 'dingbot'], level: 'debug' } }
})

const app = log4js.getLogger()
app.info('测试钉钉')
app.info('测试钉钉')
app.info('测试钉钉')
