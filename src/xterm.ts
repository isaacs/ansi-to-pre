import { NameCodes, namedBrightColors, namedColors } from './named.js'

const hex = (n: number) => n.toString(16).padStart(2, '0')

const colors = [
  ...(function* () {
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
  })(),
]

const grays = [
  ...(function* () {
    for (let gray = 0; gray < 24; gray++) {
      const g = gray * 10 + 8
      yield `#${hex(g).repeat(3)}`
    }
  })(),
]

export const xtermCode = (n: number) => {
  if (n < 8) return namedColors[n as NameCodes]
  if (n < 16) return namedBrightColors[(n - 8) as NameCodes]
  if (n < Math.pow(6, 3)) return colors[n - 16] as string
  if (n < 256) return grays[n - 232] as string
}
