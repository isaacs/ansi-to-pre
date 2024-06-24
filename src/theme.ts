import { defaultBackground, defaultColor } from './default-colors.js'
import {
  codeNames,
  nameCodes,
  namedBrightColors,
  namedColors,
  Names,
} from './named.js'

export type Theme = {
  defaultColor?: string
  defaultBackground?: string
  named?: { [name in Names]?: string }
  bright?: { [name in Names]?: string }
}

export const theme = (t?: Theme): Theme => {
  if (t) {
    if (t.defaultColor) defaultColor(t.defaultColor)
    if (t.defaultBackground) defaultBackground(t.defaultBackground)
    if (t.named) {
      for (const [name, code] of Object.entries(t.named)) {
        namedColors[nameCodes[name as Names]] = code
      }
    }
    if (t.bright) {
      for (const [name, code] of Object.entries(t.bright)) {
        namedBrightColors[nameCodes[name as Names]] = code
      }
    }
  }
  return {
    defaultColor: defaultColor(),
    defaultBackground: defaultBackground(),
    named: Object.fromEntries(
      codeNames.map(n => [n, namedColors[nameCodes[n]]]),
    ),
    bright: Object.fromEntries(
      codeNames.map(n => [n, namedBrightColors[nameCodes[n]]]),
    ),
  }
}
