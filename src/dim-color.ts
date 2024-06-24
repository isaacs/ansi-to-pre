import { hexToRgb } from './hex-to-rgb.js'
import { rgbToHex } from './rgb-to-hex.js'

const DIMLEVEL = 0.75
export const dimColor = (c: string): string =>
  rgbToHex(
    hexToRgb(c).map(c => Math.floor(c * DIMLEVEL)) as [
      number,
      number,
      number,
    ],
  )
