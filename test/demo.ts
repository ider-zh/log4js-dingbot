/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 01:31:08
 * @LastEditors: ider
 * @LastEditTime: 2021-04-06 13:12:38
 * @Description:
 */

import log4js from 'log4js'

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    dingbot: {
      type: './src/index',
      access_token:
        '68c56f440c4cc6e894f0637b21418e8ab2594fd14a72e8228349c575c91375eb',
      secret:
        'SECefecc96347fe11df010a2a1a231d4bd521d891d9b74292d12af027b3ebaf5dcd',
      sendInterval: 1,
    }
  },
  categories: { default: { appenders: ['out', 'dingbot'], level: 'debug' } },
})


function generateRamStr(len) {
  // const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const chars = '我们时常会遇到一些特定的场景需要我们生成随机字符串'
  let randomStr = "";
  for (let i = 0; i < len; i++) {
  randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomStr;
}


const app = log4js.getLogger()
const ss = generateRamStr(50)
console.log(unescape(encodeURIComponent(ss)).length)
console.log(new TextEncoder().encode(ss).length)
// app.info('测试钉钉')
app.info('测试钉钉1')
app.debug('测试钉钉2')
app.info('测试钉钉3')
app.info('测试钉钉4')
app.info('测试钉钉5')

app.info(ss)
