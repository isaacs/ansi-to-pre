import { InspectOptions } from 'util'
import { fixEmoji } from './fix-emoji.js'
import { Style } from './style.js'

/**
 * A representation of a run of text in a given style
 */
export class Block {
  #style?: Style
  #text: string

  constructor(text: string, style?: Style) {
    this.#text = text
    this.#style = style
  }

  [Symbol.for('nodejs.util.inspect.custom')](
    _: any,
    opts: InspectOptions,
    inspect: typeof import('util').inspect,
  ) {
    return `Block {${
      this.#style ? ' ' + inspect(this.#style, opts) : ''
    } ${inspect(this.#text, opts)} }`
  }

  /** return the block as a styled `<span>` tag */
  toString() {
    return this.#toString(false)
  }

  /** a representation of the block as an ANSI styled string */
  get ansi() {
    return this.#toString(true)
  }

  #toString(ansi: boolean) {
    return (
      !this.#text ? ''
      : ansi ? (this.#style ?? Style.RESET).ansi + this.#text
      : fixEmoji((this.#style ?? Style.RESET).wrap(this.#text))
    )
  }

  /** append text to the block */
  write(c: string) {
    this.#text += c
    return this
  }

  /** the raw text that will be written */
  get text() {
    return this.#text
  }

  /** the Style used by this block */
  get style() {
    return this.#style
  }
}
