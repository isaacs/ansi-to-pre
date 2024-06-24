export * from './block.js'
export * from './default-colors.js'
export * from './named.js'
export * from './xterm.js'
export * from './style.js'
export * from './terminal.js'
export * from './theme.js'
import { Terminal } from './terminal.js'

/**
 * Convert a string of ANSI text into an HTML `<pre>` tag.
 */
export const ansiToPre = (input: string) => String(new Terminal(input))

/**
 * Convert a string of ANSI text into a string of ANSI text with normalized
 * RGB color codes and all cursor control sequences resolved.
 */
export const ansiToAnsi = (input: string) => new Terminal(input).ansi
