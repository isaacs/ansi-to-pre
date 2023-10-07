export type Names =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'

export type NameCodes = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export const nameCodes: { [name in Names]: NameCodes } = {
  black: 0b000,
  red: 0b001,
  green: 0b010,
  yellow: 0b011,
  blue: 0b100,
  magenta: 0b101,
  cyan: 0b110,
  white: 0b111,
}

export const codeNames: ReadonlyArray<Names> = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
] as const

export const namedColors: Omit<string[], number> & {
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string
} = [
  '#000000',
  '#ff0000',
  '#00a000',
  '#e0e000',
  '#0040e0',
  '#e000e0',
  '#00b0b0',
  '#e0e0e0',
]

export const namedBrightColors: Omit<string[], number> & {
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string
} = [
  '#404040',
  '#ff3030',
  '#00ff00',
  '#ffff00',
  '#0080ff',
  '#ff33ff',
  '#00ffff',
  '#ffffff',
]
