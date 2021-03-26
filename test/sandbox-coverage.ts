/*
 * @Version: 0.0.1
 * @Author: ider
 * @Date: 2021-03-25 09:12:57
 * @LastEditors: ider
 * @LastEditTime: 2021-03-27 01:23:08
 * @Description:
 */

import NYC from 'nyc'
import sandbox from '@log4js-node/sandboxed-module'

sandbox.configure({
  sourceTransformers: {
    nyc: function (source) {
      if (this.filename.indexOf('node_modules') > -1) {
        return source
      }
      const nyc = new NYC()
      return nyc.instrumenter().instrumentSync(source, this.filename)
    },
  },
})
