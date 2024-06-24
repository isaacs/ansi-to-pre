import { InspectOptions } from 'util'
import { Block } from './block.js'
import { defaultBackground, defaultColor } from './default-colors.js'
import { Style, StyleProps } from './style.js'
const CODES_RE =
  /^\u001b\[([0-9]*[A-GJKSTg]|([0-9;]*)m|([0-9]*;?[0-9]*)?[Hf]|\?[0-9]+[hl])/

const OSC_RE = /^\u001b\](.*?)(?:\u0007|\u001b\\)/
const OSC_TITLE = '0;'
const OSC_HREF = '8;;'

/**
 * A representation of a virtual "terminal" where we write out the character
 * and style information as we parse through the ANSI encoded stream.
 *
 * Important: this is *not* a full-fledged Stream class. You can write to it
 * multiple times, and it will update appropriately, but it does zero buffering
 * or input validation, so writing a partial ANSI code sequence will result in
 * mochibake in the output.
 *
 * The virtual terminal is an infinitely high and wide screen, with no
 * scrollback buffer. So, when `scrollDown(n)` is called (either explicitly, or
 * with a `\x1b[<n>S` ANSI code), `n` lines are removed from the top of the
 * "screen". When `scrollUp(n)` is called (explicitly or via a `\x1b[<n>T` ANSI
 * code), `n` _empty_ lines are added to the top of the screen; the lines lost
 * to a previous `scrollDown` action are not restored when scrolling up.
 *
 * Also, actions that move the cursor down or to the right, which would on a
 * normal physical terminal be limited to the height/width of the terminal, are
 * unbounded. For example, on an actual terminal, `echo $'\x1b[1000Bhello'`
 * will print "hello" at the bottom of the screen (unless your screen happens
 * to be more than 1000 lines high); in this virtual terminal, it will create
 * 1000 empty lines.
 *
 * Most of the methods (other than `toString()` of course) return `this`,
 * allowing for things like this:
 *
 * ```js
 * console.log(
 *   new Terminal()
 *     .setStyle({ color: '#ff0000' })
 *     .write('hello, ')
 *     .down(1)
 *     .setStyle({ inverse: true })
 *     .write('world!').ansi
 * )
 * ```
 */
export class Terminal {
  // note: 0-indexed, but all the ansi codes are 1-indexed
  #cursor: [number, number] = [0, 0]
  // character data
  #text: string[][] = []
  // the style used to write it
  #style: (Style | undefined)[][] = []
  // the current style we use to paint characters to our "screen"
  #brush: Style = new Style({})

  #title: string = ''
  #blocks?: Block[]

  constructor(input?: string) {
    if (input) this.write(input)
  }

  /**
   * Set the style that the terminal will use for text writes.
   *
   * If a string, must be a valid `\x1b[...m` ANSI style code.
   *
   * The styles provided will be appended onto the current style in use, just
   * as they would be by a real terminal if the relevant ANSI code is
   * encountered.
   */
  setStyle(style: string | StyleProps): Terminal {
    this.#brush = this.#brush.update(style)
    return this
  }

  /** Move the cursor up `n` lines, stopping at the top. */
  up(n: number): Terminal {
    this.#cursor[0] = Math.max(this.#cursor[0] - n, 0)
    return this
  }

  /** Move the cursor down `n` lines, without limit. */
  down(n: number): Terminal {
    // move down
    // in real life, this would be maxed to the size of the screen buffer,
    // but since this virtual terminal is an infinitely high and wide screen,
    // we just let it create new lines.
    this.#cursor[0] += n
    return this
  }

  /**
   * Prepend `n` empty lines at the start of the buffer, effectively moving the
   * cursor up as a result.
   */
  scrollUp(n: number): Terminal {
    // add n lines at the start of the buffer
    // leaves the cursor at the same index it was at before, effectively
    // moving it up as a result.
    for (let i = 0; i < n; i++) {
      this.#text.unshift([])
      this.#style.unshift([])
    }
    return this
  }

  /**
   * Remove `n` lines from the start of the buffer, effectively moving the
   * cursor down as a result.
   */
  scrollDown(n: number): Terminal {
    // remove lines from the top of the buffer, effectively moving
    // the cursor down as a result.
    // TODO: Maybe it would be good to keep a scrollback buffer,
    // and move lines into/out of there on scroll?
    for (let i = 0; i < n; i++) {
      this.#text.shift()
      this.#style.shift()
    }
    return this
  }

  /** Move the cursor forward `n` columns, without limit. */
  forward(n: number): Terminal {
    this.#cursor[1] += n
    return this
  }

  /** Move the cursor back `n` columns, stopping at the first column. */
  back(n: number): Terminal {
    this.#cursor[1] = Math.max(0, this.#cursor[1] - n)
    return this
  }

  /** Move to the start of the `n`-th next line. */
  nextLine(n: number): Terminal {
    this.#cursor[0] += n
    this.#cursor[1] = 0
    return this
  }

  /**
   * Move to the start of the `n`-th previous line, stopping at the top of the
   * screen.
   */
  prevLine(n: number): Terminal {
    this.#cursor[0] = Math.max(0, this.#cursor[0] - n)
    this.#cursor[1] = 0
    return this
  }

  /**
   * Move to the `n`-th column (1-indexed), limited by the left-most column.
   */
  horizontalPosition(n: number): Terminal {
    this.#cursor[1] = Math.max(0, n - 1)
    return this
  }

  /**
   * Move to the 1-indexed row and column specified, limited by the top and
   * left sides of the screen.
   */
  position(row: number, col: number): Terminal {
    this.#cursor[0] = Math.max(row - 1, 0)
    this.#cursor[1] = Math.max(col - 1, 0)
    return this
  }

  /**
   * Delete all printed data from the screen.
   *
   * Note that this is used for both `\x1b[2J` _and_ `\x1b[3J`, because there
   * is no scrollback buffer in this virtual terminal.
   */
  eraseScreen(): Terminal {
    // erase entire screen
    this.#text.length = 0
    this.#style.length = 0
    return this
  }

  /** Delete all printed data from the cursor to the end of the screen. */
  eraseScreenToEnd(): Terminal {
    // erase from cursor to end of screen
    this.#text.splice(this.#cursor[0] + 1)
    this.#style.splice(this.#cursor[0] + 1)
    this.eraseLineToEnd()
    return this
  }

  /** Delete all printed data from the top of the screen to the cursor. */
  eraseScreenFromStart(): Terminal {
    // erase from beginning of screen to cursor
    let i
    for (i = 0; i < this.#cursor[0]; i++) {
      const line = this.#text[i]
      const sline = this.#style[i]
      /* c8 ignore start */
      if (!line || !sline) continue
      /* c8 ignore stop */
      line.length = 0
      sline.length = 0
    }
    this.eraseLineFromStart()
    return this
  }

  /** Delete the contents of the current line. */
  eraseLine(): Terminal {
    const line = this.#text[this.#cursor[0]]
    const sline = this.#style[this.#cursor[0]]
    if (!line || !sline) return this
    line.length = 0
    sline.length = 0
    return this
  }

  /**
   * Delete printed data from the cursor to the end of the current line.
   */
  eraseLineToEnd(): Terminal {
    const line = this.#text[this.#cursor[0]]
    const sline = this.#style[this.#cursor[0]]
    if (!line || !sline) return this
    // from cursor to end of line
    line.splice(this.#cursor[1])
    sline.splice(this.#cursor[1])
    return this
  }

  /**
   * Delete printed data from the start of the current line to the cursor.
   */
  eraseLineFromStart(): Terminal {
    if (this.#cursor[1] === 0) return this.eraseLine()
    /* c8 ignore start */
    const line = this.#text[this.#cursor[0]]
    const sline = this.#style[this.#cursor[0]]
    /* c8 ignore stop */
    if (!line || !sline) return this
    for (let i = 0; i < this.#cursor[1]; i++) {
      line[i] = ' '
      sline[i] = undefined
    }
    return this
  }

  /**
   * Parse the ANSI encoded string provided, updating the internal character
   * and style buffers appropriately.
   */
  write(input: string): Terminal {
    this.#blocks = undefined
    // remove title-setting sequences
    for (let c = 0; c < input.length; ) {
      while (input.charAt(c) === '\x1b') {
        // codes that don't use the OSC or CSI code
        switch (input.charAt(c + 1)) {
          case 'B':
            this.horizontalPosition(1)
            c += 2
            continue
          case 'H':
            // tab stops, not supported, ignore
            c += 2
            continue
          case 'D':
            this.scrollDown(1)
            c += 2
            continue
          case 'M':
            this.scrollUp(1)
            c += 2
            continue
        }

        // cursor/screen motion/erase commands
        const code = input.substring(c).match(CODES_RE) as
          | null
          | (RegExpMatchArray & [string, string])
        if (code) {
          c += code[0].length
          if (code[1].endsWith('m')) {
            // style code
            this.setStyle(code[0])
            continue
          } else {
            const x = code[1].charAt(code[1].length - 1)
            if (x === 'H' || x === 'f') {
              // cursor position
              const [n, m] = code[1].replace(/[Hf]$/, '').split(';')
              const row = Math.max(1, parseInt(n || '1', 10))
              const col = Math.max(1, parseInt(m || '1', 10))
              this.position(row, col)
              continue
            }
            // these all have an optional 1-indexed parameter
            // that defaults to 1, except J and K which default to 0
            const p = code[1].match(/^([0-9]+)/)?.[1]
            const n = parseInt(p || '1', 10)
            const z = parseInt(p || '0', 10)
            switch (x) {
              case 'A':
                this.up(n)
                continue
              case 'T':
                this.scrollUp(n)
                continue
              case 'B':
                this.down(n)
                continue
              case 'S':
                this.scrollDown(n)
                continue
              case 'C':
                this.forward(n)
                continue
              case 'D':
                this.back(n)
                continue
              case 'E':
                this.nextLine(n)
                continue
              case 'F':
                this.prevLine(n)
                continue
              case 'G':
                this.horizontalPosition(n)
                continue
              case 'J': {
                switch (z) {
                  case 0:
                    this.eraseScreenToEnd()
                    continue
                  case 1:
                    this.eraseScreenFromStart()
                    continue
                  case 2:
                  case 3:
                    this.eraseScreen()
                    continue
                }
                continue
              }
              case 'K': {
                switch (z) {
                  case 0:
                    this.eraseLineToEnd()
                    continue
                  case 1:
                    this.eraseLineFromStart()
                    continue
                  case 2:
                    this.eraseLine()
                    continue
                }
                continue
              }
            }
          }
          continue
        }

        // check for OSC (title and hyperlinks)
        const osc = input.substring(c).match(OSC_RE) as
          | null
          | (RegExpMatchArray & [string, string])
        if (osc?.index === 0) {
          c += osc[0].length
          const cmd = osc[1]
          if (cmd.startsWith(OSC_TITLE)) {
            this.setTitle(cmd.substring(OSC_TITLE.length))
            continue
          }
          if (cmd.startsWith(OSC_HREF)) {
            this.setStyle({ href: cmd.substring(OSC_HREF.length) })
            continue
          }
          continue
        }

        // some other code we don't support, treat as text
        break
      }

      // end parsing ansi codes, might have walked off the input
      if (c >= input.length) break

      const ch = input.charAt(c++)

      if (ch === '\r') {
        this.horizontalPosition(1)
        continue
      }
      if (ch === '\n') {
        this.nextLine(1)
        continue
      }

      // write a character
      // if we are off the painted terminal, paint up to that point
      while (this.#text.length < this.#cursor[0]) {
        this.#text.push([])
        this.#style.push([])
      }
      const sline = this.#style[this.#cursor[0]] || []
      const line = this.#text[this.#cursor[0]] || []
      while (line.length < this.#cursor[1]) {
        line.push(' ')
      }
      while (sline.length < this.#cursor[1]) {
        sline.push(undefined)
      }
      line[this.#cursor[1]] = ch
      sline[this.#cursor[1]] =
        this.#brush.isReset ? undefined : this.#brush
      this.#style[this.#cursor[0]] = sline
      this.#text[this.#cursor[0]] = line
      this.forward(1)
    }
    return this
  }

  /**
   * Called when an OSC code of `\x1b]0;...\x1b\` is encountered.
   *
   * Sets the `title` attribute on the root `<pre>` in html output,
   * and creates a corresponding OSC title sequence in the ansi output.
   */
  setTitle(s: string) {
    this.#title = s
    return this
  }

  /** the raw unstyled text of each line */
  get text() {
    return this.#text.map(l => l.join(''))
  }

  [Symbol.for('nodejs.util.inspect.custom')](
    _: any,
    opts: InspectOptions,
    inspect: typeof import('util').inspect,
  ) {
    const ins = inspect(
      {
        cursor: this.#cursor,
        brush: this.#brush,
        text: this.#text.map(l => l.join('')),
        blocks: this.blocks,
      },
      opts,
    )
    return `Terminal ${ins}`
  }

  /**
   * Output the results of the style and character buffers as ANSI
   * styled text. This effectively normalizes all color codes to explicit
   * RGB values and resolves all cursor motions and other control codes,
   * and styling runs of identical styles with a single code.
   */
  get ansi() {
    return this.#toString(true)
  }

  /**
   * Output the results of the style and character buffers as a `<pre>`
   * tag with `<span>` elements setting effective styles.
   */
  toString() {
    return this.#toString(false)
  }

  /**
   * An array of `Block` objects each representing a string of text with a
   * given style.
   */
  get blocks(): Block[] {
    if (this.#blocks) return this.#blocks
    let cur: Block = new Block('')
    const blocks: Block[] = [cur]
    for (let i = 0; i < this.#text.length; i++) {
      /* c8 ignore start */
      const line = this.#text[i] || []
      const sline = this.#style[i] || []
      /* c8 ignore stop */
      for (let j = 0; j < line.length; j++) {
        const st = sline[j]
        // will always be set
        /* c8 ignore start */
        const ch = line[j] || ''
        /* c8 ignore stop */
        if (st === cur.style) cur.write(ch)
        else blocks.push((cur = new Block(ch, st)))
      }
      // append a \n only if we're not at the end
      if (this.#text[i + 1]) cur.write('\n')
    }
    return (this.#blocks = blocks.filter(b => !!b.text))
  }

  #toString(ansi: boolean) {
    // turn into an array of [string, Style?], concatenating runs
    // of the same style into a single string.
    const contents = this.blocks
      .map(b => (ansi ? b.ansi : b.toString()))
      .join('')
    if (ansi) {
      const title = this.#title ? `\x1b]0;${this.#title}\x1b\\` : ''
      return title + contents + '\x1b[m'
    }
    const css = Object.entries({
      color: defaultColor(),
      background: defaultBackground(),
      position: 'relative',
    })
      .map(kv => kv.join(':'))
      .join(';')
    const preStyle = `style="${css}"`
    const preTitle = this.#title ? ` title="${this.#title}"` : ''
    return `<pre ${preStyle}${preTitle}>${contents}</pre>`
  }
}
