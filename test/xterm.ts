import t from 'tap'
import { hexToRgb } from '../src/hex-to-rgb.js'
import { namedBrightColors, namedColors } from '../src/named.js'
import { xtermCode } from '../src/xterm.js'

const n = [
  ...(namedColors as string[]),
  ...(namedBrightColors as string[]),
]
for (let i = 0; i < 16; i++) {
  t.equal(xtermCode(i), n[i])
}

t.equal(xtermCode(150), '#afd787')
t.equal(xtermCode(999), undefined)
t.equal(xtermCode(-1), undefined)

for (let gray = 232; gray < 256; gray++) {
  const [r, g, b] = hexToRgb(xtermCode(gray) as string)
  t.equal(r, g, 'grayscale, red and green equal')
  t.equal(r, b, 'grayscale, red and blue equal')
}
