import { namedBright, namedCodes } from './named.js'

const hex = (n: number) => n.toString(16).padStart(2, '0')

function* colors() {
  for (let red = 0; red < 6; red++) {
    for (let green = 0; green < 6; green++) {
      for (let blue = 0; blue < 6; blue++) {
        const r = red ? red * 40 + 55 : 0
        const g = green ? green * 40 + 55 : 0
        const b = blue ? blue * 40 + 55 : 0
        yield `#${hex(r)}${hex(g)}${hex(b)}`
      }
    }
  }
}

function* grays() {
  for (let gray = 0; gray < 24; gray++) {
    const g = gray * 10 + 8
    yield `#${hex(g).repeat(3)}`
  }
}

export const xtermCodes = [
  ...namedCodes,
  ...namedBright,
  ...colors(),
  ...grays(),
]
