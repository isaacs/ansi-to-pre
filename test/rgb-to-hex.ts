import t from 'tap'
import { rgbToHex } from '../src/rgb-to-hex.js'

t.equal(rgbToHex([0x10, 0x20, 0x30]), '#102030')
t.throws(() => rgbToHex([1, NaN, 2]), {
  message: 'invalid RGB: 1,NaN,2',
})
