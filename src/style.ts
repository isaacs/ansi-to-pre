// this object is deposited into the style buffer in the Terminal
// every time a character is written to the character buffer.
// Handles all parsing of \x1b[...m ANSI codes and conversion to CSS.
import { DEFAULT_BG, DEFAULT_FG } from './default-colors.js'
import { dimColor } from './dim-color.js'
import { hexToRgb } from './hex-to-rgb.js'
import { namedBright, namedCodes, names } from './named.js'
import { rgbToHex } from './rgb-to-hex.js'
import { xtermCodes } from './xterm.js'

const ALL_END = '0'
const BG_END = '49'
const BG_START = '48'
const BOLD_END = '22'
const BOLD_START = '1'
const DIM_START = '2'
// DIM_END is the same as BOLD_END because it's really "font-weight:normal"
// In practice, dim modifies color, not font-weight, since modern screens
// have colors, and most terminal fonts don't distinguish font weights other
// than normal and bold.
const FG_END = '39'
const FG_START = '38'
const INV_END = '27'
const INV_START = '7'
const ITALIC_END = '23'
const ITALIC_START = '3'
const OVER_END = '55'
const OVER_START = '53'
const STRIKE_END = '29'
const STRIKE_START = '9'
const UNDERLINE_END = '24'
const UNDERLINE_START = '4'
const UNDERLINE_START_2 = '21' // WHYYYYYY

const NAMED_RE = /^(3|4|9|10)([0-7])$/
const NAMED_FG = '3'
const NAMED_BG = '4'
const NAMED_FG_BRIGHT = '9'
const NAMED_BG_BRIGHT = '10'

/**
 * The properties that can be set on Style objects
 */
export type StyleProps = {
  background?: string
  bold?: boolean
  color?: string
  dim?: boolean
  inverse?: boolean
  italic?: boolean
  overline?: boolean
  strike?: boolean
  underline?: boolean
}

const RESET = {
  background: '',
  bold: false,
  color: '',
  dim: false,
  inverse: false,
  italic: false,
  overline: false,
  strike: false,
  underline: false,
}

const namedColor = (c: string, bright = false): string => {
  if (!c) return c
  const code = names[c as keyof typeof names]
  if (typeof code === 'number') {
    return (bright ? namedBright[code] : namedCodes[code]) as string
  }
  if (c.includes('bright') && !bright) {
    return namedColor(c.replace(/bright/g, ''), true)
  }
  return rgbToHex(hexToRgb(c))
}

const SEEN = new Map<string, Style>()

/**
 * An immutable representation of an ANSI style. Used by Terminal and Block
 * to represent the styles in use for text to be printed.
 * If a Style object is created with the same properties as a
 * formerly seen Style object, the same object will be returned.
 *
 * For example:
 *
 * ```js
 * const a = new Style({ bold: true })
 * const b = new Style({ bold: true })
 * assert.equal(a, b) // passes
 * ```
 *
 * This optimization cuts down considerably on object creation,
 * because a Style is created for each styled character written to
 * the Terminal buffer. It also means that Style objects can be
 * compared directly with `===` to test for equivalence.
 */
export class Style {
  #css?: string

  #background!: string
  #bold!: boolean
  #color!: string
  #dim!: boolean
  #inverse!: boolean
  #italic!: boolean
  #overline!: boolean
  #strike!: boolean
  #underline!: boolean
  #isReset!: boolean
  #ansi!: string

  constructor(styles: StyleProps | string) {
    const {
      background = '',
      bold = false,
      color = '',
      dim = false,
      inverse = false,
      italic = false,
      overline = false,
      strike = false,
      underline = false,
    } = typeof styles !== 'string' ? styles : Style.ansiProperties(styles)

    const ansi = Style.propertiesAnsi({
      background,
      bold,
      color,
      dim,
      inverse,
      italic,
      overline,
      strike,
      underline,
    })

    // same style = same object
    const seen = SEEN.get(ansi)
    if (seen) return seen
    SEEN.set(ansi, this)

    this.#ansi = ansi
    this.#background = namedColor((background ?? '').toLowerCase())
    this.#bold = bold ?? false
    this.#color = namedColor((color ?? '').toLowerCase())
    this.#dim = dim ?? false
    this.#inverse = inverse ?? false
    this.#italic = italic ?? false
    this.#overline = overline ?? false
    this.#strike = strike ?? false
    this.#underline = underline ?? false
    this.#isReset = ansi === '\x1b[0m'
  }

  /**
   * True if this style is a full reset of all properties.
   */
  get isReset() {
    return this.#isReset
  }

  /** corresponding `\x1b[...m` ANSI code */
  get ansi() {
    return this.#ansi
  }

  /** Convert a set of properties to an ANSI style code */
  static propertiesAnsi(styles: StyleProps): string {
    const {
      background,
      bold,
      color,
      dim,
      inverse,
      italic,
      overline,
      strike,
      underline,
    } = styles
    const codes = [
      // always do a reset at the start
      0,
      ...(color ? [FG_START, 2, ...hexToRgb(namedColor(color))] : []),
      ...(background
        ? [BG_START, 2, ...hexToRgb(namedColor(background))]
        : []),
      ...(bold ? [BOLD_START] : []),
      ...(dim ? [DIM_START] : []),
      ...(inverse ? [INV_START] : []),
      ...(italic ? [ITALIC_START] : []),
      ...(overline ? [OVER_START] : []),
      ...(strike ? [STRIKE_START] : []),
      ...(underline ? [UNDERLINE_START] : []),
    ]
    return `\x1b[${codes.join(';')}m`
  }

  /** Convert an ANSI style code to a set of properties */
  static ansiProperties(code: string): StyleProps {
    if (!code.startsWith('\x1b[') || !code.endsWith('m')) {
      throw new Error('invalid ansi style code: ' + code)
    }
    const style: StyleProps = {}
    const codes = code.substring(2, code.length - 1).split(';')
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i] as string
      switch (c) {
        case '':
        case ALL_END:
          Object.assign(style, RESET)
          continue
        case BOLD_END:
          style.bold = false
          style.dim = false
          continue
        case ITALIC_END:
          style.italic = false
          continue
        case STRIKE_END:
          style.strike = false
          continue
        case OVER_END:
          style.overline = false
          continue
        case UNDERLINE_END:
          style.underline = false
          continue
        case INV_END:
          style.inverse = false
          continue
        case FG_END:
          style.color = ''
          continue
        case BG_END:
          style.background = ''
          continue
        case BOLD_START:
          style.bold = true
          continue
        case INV_START:
          style.inverse = true
          continue
        case UNDERLINE_START:
        case UNDERLINE_START_2:
          style.underline = true
          continue
        case DIM_START:
          style.dim = true
          continue
        case OVER_START:
          style.overline = true
          continue
        case ITALIC_START:
          style.italic = true
          continue
        case STRIKE_START:
          style.strike = true
          continue
        case BG_START:
        case FG_START: {
          // 2 for rgb, 5 for xterm
          const next = codes[i + 1]
          const prop = c == FG_START ? 'color' : 'background'
          switch (next) {
            case '5':
              const xt = codes[i + 2]
              const code = xt && xtermCodes[parseInt(xt, 10)]
              if (code) {
                i += 2
                style[prop] = code
              }
              continue
            case '2':
              const sr = codes[i + 2]
              const sg = codes[i + 3]
              const sb = codes[i + 4]
              if (sr && sg && sb) {
                const r = parseInt(sr, 10)
                const g = parseInt(sg, 10)
                const b = parseInt(sb, 10)
                const hex = rgbToHex([r, g, b])
                if (
                  r <= 255 &&
                  r >= 0 &&
                  g <= 255 &&
                  g >= 0 &&
                  b <= 255 &&
                  b >= 0
                ) {
                  i += 4
                  style[prop] = hex
                }
              }
          }
          continue
        }
        // named color/bg
        default: {
          const m = c.match(NAMED_RE) as
            | null
            | (RegExpMatchArray & [string, string, string])
          if (!m) continue
          const color = parseInt(m[2], 10)
          if (!color && color !== 0) continue
          switch (m[1]) {
            case NAMED_FG:
              style.color = namedCodes[color]
              continue
            case NAMED_BG:
              style.background = namedCodes[color]
              continue
            case NAMED_FG_BRIGHT:
              style.color = namedBright[color]
              continue
            case NAMED_BG_BRIGHT:
              style.background = namedBright[color]
              continue
          }
        }
      }
    }
    return style
  }

  /**
   * Return a new Style with this one plus the updated properties.
   *
   * If a string is provided, must be a valid `\x1b[...m` ANSI style code,
   * though unrecognized properties within that code will be ignored rather
   * than throwing an error.
   */
  update(properties: StyleProps | string): Style {
    const {
      background = this.#background,
      bold = this.#bold,
      color = this.#color,
      dim = this.#dim,
      inverse = this.#inverse,
      italic = this.#italic,
      overline = this.#overline,
      strike = this.#strike,
      underline = this.#underline,
    } = typeof properties === 'string'
      ? Style.ansiProperties(properties)
      : properties
    return background === this.#background &&
      bold === this.#bold &&
      color === this.#color &&
      dim === this.#dim &&
      inverse === this.#inverse &&
      italic === this.#italic &&
      overline === this.#overline &&
      strike === this.#strike &&
      underline === this.#underline
      ? this
      : new Style({
          background,
          bold,
          color,
          dim,
          inverse,
          italic,
          overline,
          strike,
          underline,
        })
  }

  [Symbol.for('nodejs.util.inspect.custom')](
    _: any,
    { colors }: { colors: boolean } = { colors: false }
  ) {
    const { ansi } = this
    return `Style { ${colors ? ansi : ''}${ansi.substring(1)}${
      colors ? '\x1b[m' : ''
    } }`
  }

  toString() {
    if (this.#css) return this.#css
    let color = this.#inverse ? this.#background : this.#color
    const background = this.#inverse ? this.#color : this.#background
    // dim text is a different color, unless the background is the same
    // color, and set to something other than default. !?!? hwyyyyyyy idgi
    if (this.#dim && !(color && color === background)) {
      color = dimColor(color || (this.#inverse ? DEFAULT_BG : DEFAULT_FG))
    }
    const textDecoration = [
      ...(this.#underline ? ['underline'] : []),
      ...(this.#overline ? ['overline'] : []),
      ...(this.#strike ? ['line-through'] : []),
    ].join(' ')

    return (this.#css = [
      ...(textDecoration ? [`text-decoration:${textDecoration}`] : []),
      ...(this.#bold
        ? ['font-weight:bold']
        : this.#dim
        ? ['font-weight:100']
        : []),
      ...(this.#italic ? ['font-style:italic'] : []),
      ...(color ? [`color:${color}`] : []),
      ...(background ? [`background:${background}`] : []),
    ].join(';'))
  }
}
