import {readdirSync, readFileSync} from 'fs'
import {resolve} from 'path'
import t from 'tap'
import {fileURLToPath} from 'url'
import {inspect} from 'util'
import { Terminal } from '../dist/esm/terminal.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const fixtures = resolve(__dirname, 'fixtures')
const files = readdirSync(fixtures).filter(f => f.endsWith('.out')).map(f => resolve(fixtures, f))
for (const file of files) {
  t.test(file, async t => {
    const term = new Terminal(readFileSync(file, 'utf8'))
    t.matchSnapshot(term.ansi, 'ansi')
    t.matchSnapshot(String(term), 'html')
    t.matchSnapshot(inspect(term, { colors: true }), 'inspect colors')
    t.matchSnapshot(inspect(term, { colors: false }), 'inspect no colors')
  })
}
