import t from 'tap'
import { hexToRgb } from '../src/hex-to-rgb.js'
import { namedBright, namedCodes } from '../src/named.js'
import { xtermCodes } from '../src/xterm.js'

t.strictSame(xtermCodes.slice(0, 16), [...namedCodes, ...namedBright])

for (const gray of xtermCodes.slice(231)) {
  const [r, g, b] = hexToRgb(gray)
  t.equal(r, g, 'grayscale, red and green equal')
  t.equal(r, b, 'grayscale, red and blue equal')
}
