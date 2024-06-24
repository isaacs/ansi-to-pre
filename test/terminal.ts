import { readdirSync, readFileSync } from 'fs'
import { basename, resolve } from 'path'
import t from 'tap'
import { fileURLToPath } from 'url'
import { inspect } from 'util'
import { Terminal } from '../dist/esm/terminal.js'

const RESET = '\x1b]8;;\x1b\\\x1b[0m'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const fixtures = resolve(__dirname, 'fixtures')
const files = readdirSync(fixtures)
  .filter(f => f.endsWith('.out'))
  .map(f => resolve(fixtures, f))
for (const file of files) {
  t.test(basename(file), async t => {
    const term = new Terminal(readFileSync(file, 'utf8'))
    t.matchSnapshot(term.ansi, 'ansi')
    t.matchSnapshot(String(term), 'html')
    // these change between node versions, just run for coverage
    inspect(term, { colors: true })
    inspect(term, { colors: false })
  })
}

t.test('create lines when jumping to position off screen', t => {
  const term = new Terminal()
  term.position(10, 10)
  term.write('ok')
  t.strictSame(term.text, [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '         ok',
  ])
  t.end()
})

t.test('unknown OSC is ignored', t => {
  const term = new Terminal(`a \x1b]123\x1b\\ b`)
  t.equal(term.ansi, RESET + 'a  b\x1b[m')
  t.end()
})

t.test('unknown code is passed through', t => {
  const term = new Terminal(`a \x1byolo b`)
  t.equal(term.ansi, RESET + 'a \x1byolo b\x1b[m')
  t.end()
})

t.test('erase line', t => {
  t.equal(
    new Terminal(`aaaaa\x1b[2D\x1b[2Kb`).ansi,
    RESET + '   b\x1b[m',
    'erase line',
  )
  t.equal(
    new Terminal(`aaaaa\x1b[2D\x1b[1Kb`).ansi,
    RESET + '   ba\x1b[m',
    'erase line from start',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1bB\x1b[1Kb`).ansi,
    RESET + 'aaaaa\nb\x1b[m',
    'erase line from start when start is column 0',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1b[B\x1b[1K`).ansi,
    RESET + 'aaaaa\naaaaa\x1b[m',
    'erase line from start when line not written, no-op',
  )
  t.equal(
    new Terminal(`aaaaa\x1b[2D\x1b[0Kb`).ansi,
    RESET + 'aaab\x1b[m',
    'erase line to end',
  )
  t.equal(
    new Terminal(`aaaaa\x1b[2D\x1b[9Kb`).ansi,
    RESET + 'aaaba\x1b[m',
    'unknown erase line param',
  )
  t.end()
})

t.test('erase screen', t => {
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\r\naaaaa\x1b[2;3H\x1b[3Jb`).ansi,
    RESET + '\n  b\x1b[m',
    'erase screen and scrollback (so just screen)',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\r\naaaaa\x1b[2;3H\x1b[2Jb`).ansi,
    RESET + '\n  b\x1b[m',
    'erase screen',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\r\naaaaa\x1b[2;3H\x1b[1Jb`).ansi,
    RESET + '\n  baa\naaaaa\x1b[m',
    'erase screen from start',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\r\naaaaa\x1b[2;3H\x1b[99Jb`).ansi,
    RESET + 'aaaaa\naabaa\naaaaa\x1b[m',
    'erase screen unknown param',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\r\naaaaa\x1b[2;3H\x1b[0Jb`).ansi,
    RESET + 'aaaaa\naab\x1b[m',
    'erase screen to end',
  )
  t.end()
})

t.test('prevLine, nextLine', t => {
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1b[1;5H\x1b[Eb`).ansi,
    RESET + 'aaaaa\nbaaaa\x1b[m',
    'nextLine',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1b[Fb`).ansi,
    RESET + 'baaaa\naaaaa\x1b[m',
    'nextLine',
  )
  t.end()
})

t.test('up, down', t => {
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1b[Ab`).ansi,
    RESET + 'aaaaab\naaaaa\x1b[m',
    'up',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1b[1;5H\x1b[Bb`).ansi,
    RESET + 'aaaaa\naaaab\x1b[m',
    'down',
  )
  t.end()
})
t.test('scrollUp, scrollDown', t => {
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1b[2Tb`).ansi,
    RESET + '\n     b\naaaaa\naaaaa\x1b[m',
    'scrollUp',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1bM\x1bMb`).ansi,
    RESET + '\n     b\naaaaa\naaaaa\x1b[m',
    'scrollUp with ^[M',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1b[2Sb`).ansi,
    RESET + '\n     b\x1b[m',
    'scrollDown',
  )
  t.equal(
    new Terminal(`aaaaa\r\naaaaa\x1bD\x1bDb`).ansi,
    RESET + '\n     b\x1b[m',
    'scrollDown with ^[D',
  )
  t.end()
})

t.test('^[B goes to beginning of line', t => {
  t.equal(new Terminal(`aaaaa\x1bBb`).ansi, RESET + 'baaaa\x1b[m')
  t.end()
})
