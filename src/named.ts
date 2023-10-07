export type Names =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'

export const names: { [name in Names]: number } = {
  black: 0b000,
  red: 0b001,
  green: 0b010,
  yellow: 0b011,
  blue: 0b100,
  magenta: 0b101,
  cyan: 0b110,
  white: 0b111,
}

export const namedCodes = [
  '#000000',
  '#ff0000',
  '#00a000',
  '#e0e000',
  '#0040e0',
  '#e000e0',
  '#00b0b0',
  '#e0e0e0',
] as const

export const namedBright = [
  '#404040',
  '#ff3030',
  '#00ff00',
  '#ffff00',
  '#0080ff',
  '#ff33ff',
  '#00ffff',
  '#ffffff',
] as const
