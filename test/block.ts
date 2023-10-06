import t from 'tap'
import { inspect } from 'util'
import { Block } from '../src/block.js'
import { Style } from '../src/style.js'

t.test('red and bold', t => {
  const redBold = new Style({ color: 'red', bold: true })
  const block = new Block('some', redBold)
  block.write(' text')

  t.matchSnapshot(String(block))
  t.matchSnapshot(block.ansi + '\x1b[m')
  t.matchSnapshot(block.text)
  t.matchSnapshot(block.style)
  t.matchSnapshot(inspect(block, { colors: false }))
  t.matchSnapshot(inspect(block, { colors: true }))
  t.end()
})

t.test('blue underlines hyperlink', t => {
  const redBold = new Style({
    color: 'blue',
    underline: true,
    href: 'https://izs.me',
  })
  const block = new Block('some', redBold)
  block.write(' text')

  t.matchSnapshot(String(block))
  t.matchSnapshot(block.ansi + '\x1b[m')
  t.matchSnapshot(block.text)
  t.matchSnapshot(block.style)
  t.matchSnapshot(inspect(block, { colors: false }))
  t.matchSnapshot(inspect(block, { colors: true }))
  t.end()
})

t.test('unstyled', t => {
  const block = new Block('some text')
  t.matchSnapshot(String(block))
  t.matchSnapshot(block.ansi)
  t.matchSnapshot(block.text)
  t.matchSnapshot(block.style)
  t.matchSnapshot(inspect(block, { colors: false }))
  t.matchSnapshot(inspect(block, { colors: true }))
  t.end()
})

t.test('empty', t => {
  const block = new Block('')
  t.matchSnapshot(String(block))
  t.matchSnapshot(block.ansi)
  t.matchSnapshot(block.text)
  t.matchSnapshot(block.style)
  t.matchSnapshot(inspect(block, { colors: false }))
  t.matchSnapshot(inspect(block, { colors: true }))
  t.end()
})
