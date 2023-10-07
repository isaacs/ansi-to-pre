import t from 'tap'
import { hexToRgb } from '../src/hex-to-rgb.js'

t.strictSame(hexToRgb('abc'), [0xaa, 0xbb, 0xcc])
t.strictSame(hexToRgb('#abc'), [0xaa, 0xbb, 0xcc])
t.strictSame(hexToRgb('a0b0c0'), [0xa0, 0xb0, 0xc0])
t.strictSame(hexToRgb('#a0b0c0'), [0xa0, 0xb0, 0xc0])
t.throws(() => hexToRgb('#zyxw'), {
  message: 'invalid hex string: zyxw',
})
t.throws(() => hexToRgb('zyxw'), {
  message: 'invalid hex string: zyxw',
})
t.throws(() => hexToRgb('#zyxwvu'), {
  message: 'invalid hex string: zyxwvu',
})
t.throws(() => hexToRgb('zyxwvu'), {
  message: 'invalid hex string: zyxwvu',
})
