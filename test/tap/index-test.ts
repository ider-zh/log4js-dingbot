/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 09:18:54
 * @LastEditors: ider
 * @LastEditTime: 2021-03-27 01:54:38
 * @Description:
 */

import sandbox from '@log4js-node/sandboxed-module'
import appender = require('../../src')
import { test } from 'tap'

function setupLogging(
  options,
  netError: Error | null,
  signError: string | null,
) {
  const fakeAxios = {
    msgs: [],
    url: null,
    data: null,
    params: null,
    post: async (url: string, data: any, params: object) => {
      fakeAxios.url = url
      fakeAxios.data = data
      fakeAxios.params = params
      fakeAxios.msgs.push(data.text.content)
      if (netError !== null) {
        throw netError
      } else if (signError !== null) {
        return {
          data: {
            errcode: 403,
            errmsg: signError,
          },
        }
      } else {
        return {
          data: { errcode: 0, errmsg: 'ok' },
        }
      }
    },
  }

  const fakeLayouts = {
    layout: function (type, config) {
      this.type = type
      this.config = config
      return evt => evt.data[0]
    },
    basicLayout: evt => evt.data[0],
    type: null,
    config: null,
  }

  const fakeConsole = {
    errors: [],
    error: function (msg, value) {
      this.errors.push({ msg: msg, value: value })
    },
  }

  options.type = '@ruangnazi/log4js-dingbot'
  const appenderModule = sandbox
    .require('../../src', {
      requires: {
        axios: fakeAxios,
      },
      globals: {
        console: fakeConsole,
      },
    })
    .configure(options, fakeLayouts)

  return {
    appender: appenderModule,
    logger: msg => appenderModule({ data: [msg] }),
    axios: fakeAxios,
    layouts: fakeLayouts,
    console: fakeConsole,
  }
}

function checkMessages(assert, result) {
  result.axios.msgs.forEach((msg, i) => {
    assert.match(msg.trim(), `Log event #${i + 1}`)
  })
}

test('log4js dingbotAppender', batch => {
  batch.test('module should export a configure function', t => {
    t.type(appender.configure, 'function')
    t.end()
  })

  batch.test('dingbot setup', t => {
    const result = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
      },
      null,
      null,
    )

    result.logger('some log event')

    t.test('dingbot credentials should match', assert => {
      assert.equal(result.axios.params.params.access_token, 'TOKEN')
      assert.end()
    })
    t.end()
  })

  batch.test('basic usage', t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
      },
      null,
      null,
    )

    setup.logger('Log event #1')

    t.equal(setup.axios.msgs.length, 1, 'should be one message only')
    checkMessages(t, setup)
    t.end()
  })

  batch.test('test no secret', t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
      },
      null,
      null,
    )

    setup.logger('Log event #1')
    t.assert(setup.axios.params.params.sign === undefined, 'should be no sign')
    checkMessages(t, setup)
    t.end()
  })

  batch.test('nterval usage', async t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
        sendInterval: 1,
      },
      null,
      null,
    )
    setup.logger('Log event #1')
    setup.logger('Log event #2')
    setup.logger('Log event #3')
    await sleep(1100)
    t.equal(setup.axios.msgs.length, 1, 'should be one message only')
    checkMessages(t, setup)
    t.end()
  })

  batch.test('config with layout', t => {
    const result = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
        layout: {
          type: 'tester',
        },
      },
      null,
      null,
    )
    t.equal(result.layouts.type, 'tester', 'should configure layout')
    t.end()
  })

  batch.test('separate notification for each event', t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
      },
      null,
      null,
    )
    setup.logger('Log event #1')
    setup.logger('Log event #2')
    setup.logger('Log event #3')

    t.equal(setup.axios.msgs.length, 3, 'should be three messages')
    checkMessages(t, setup)
    t.end()
  })

  batch.test('should send errors to console', async t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
      },
      null,
      '444',
    )
    setup.logger('this will fail')

    await sleep(100)

    t.equal(setup.axios.msgs.length, 1, 'should be one message sent')
    t.equal(setup.console.errors.length, 1, 'should be one error on console')
    t.end()
  })

  batch.test('test net error', async t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
      },
      Error('net error'),
      null,
    )
    setup.logger('this will fail')
    await sleep(100)
    t.equal(setup.axios.msgs.length, 1, 'should be one message sent')
    t.equal(setup.console.errors.length, 1, 'should be one error on console')
    t.equal(
      setup.console.errors[0].msg,
      'log4js:dingbot - Error sending log to dingbot: ',
    )
    t.end()
  })

  batch.test('should not break if shutdown ', t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
        shutdownTimeout: 1,
      },
      null,
      null,
    )
    t.equal(setup.axios.msgs.length, 0, 'should not be any messages yet')

    setup.appender.shutdown(() => {
      t.equal(setup.axios.msgs.length, 0)
      t.end()
    })
  })

  batch.test(
    'should only wait a specified time for sending remaining msg',
    t => {
      const setup = setupLogging(
        {
          access_token: 'TOKEN',
          secret: '#secret',
          shutdownTimeout: 1,
        },
        null,
        null,
      )
      setup.logger('Log event #1')
      t.equal(setup.axios.msgs.length, 1, 'should not be any messages yet')

      setup.appender.shutdown(() => {
        t.equal(setup.axios.msgs.length, 1)
        t.end()
      })
    },
  )

  batch.test('should send sendInterval', async t => {
    const setup = setupLogging(
      {
        access_token: 'TOKEN',
        secret: '#secret',
        sendInterval: 1,
      },
      null,
      null,
    )
    setup.logger('log event #0')
    setup.logger('log event #1')
    t.equal(setup.axios.msgs.length, 0, 'should not be any messages yet')
    await sleep(1500)
    t.equal(setup.axios.msgs.length, 1, 'should be one message sent')
    t.equal(setup.console.errors.length, 0, 'should be none error on console')
    t.end()
  })

  batch.end()
})

async function sleep(timeout: number) {
  return new Promise((resolve: Function) => {
    setTimeout(function () {
      resolve()
    }, timeout)
  })
}
