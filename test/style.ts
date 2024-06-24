import t from 'tap'
import { inspect } from 'util'
import { Style, StyleProps } from '../src/style.js'

t.equal(new Style({}), Style.RESET, 'empty style is reset style')

t.throws(() => new Style('\x1b invalid ansi code '), {
  message:
    'invalid ansi style code: ' +
    JSON.stringify('\x1b invalid ansi code '),
})

t.throws(() => new Style('\x1b[1m hello \x1b[2m'), {
  message:
    'invalid ansi style code: ' + JSON.stringify('\x1b[1m hello \x1b[2m'),
})

t.equal(new Style('\x1b[m'), new Style('\x1b[0m'), '0 and "" equivalent')

t.test('styling from ansi code', t => {
  const codes: string[] = [
    [0],
    [49],
    [48, 5, 123],
    [48, 2, 11, 22, 33],
    [41],
    [104],
    [39],
    [94],
    [9],
    [29],
    [38, 5, 123],
    [38, 2, 11, 22, 33],
    [31],
    [1],
    [2],
    [2, 48, 5, 123, 38, 5, 123],
    [1, 2, 48, 5, 123, 38, 5, 123],
    [22],
    [41, 34],
    [7],
    [27],
    [53],
    [55],
    [4],
    [24],
    [3],
    [21],
    [24],
    [23],
    [1234567890],
  ].map(s => `\x1b[${s.join(';')}m`)
  const hrefs: string[] = [
    '',
    '\x1b]8;;https://izs.me\x1b\\',
    '\x1b]8;;\x1b\\',
  ]

  let acc = new Style({})
  let i = 0
  for (const c of codes) {
    for (const href of hrefs) {
      const code = c + href
      const s = new Style(code)
      const props = Style.ansiProperties(code)
      const ansiFromProps = Style.propertiesAnsi(props)

      t.equal(ansiFromProps, s.ansi)
      const fromProps = new Style(props)
      t.equal(s, fromProps, 'same style, same object')
      const upCode = acc.update(code)
      const upProps = acc.update(props)
      t.equal(upCode, upProps, 'acc same via props or code', {
        code,
        props,
        upCode: upCode.ansi,
        upProps: upProps.ansi,
      })
      acc = upCode
      t.matchSnapshot(
        `${JSON.stringify(code)} ${JSON.stringify(s.ansi)}
${JSON.stringify(props, null, 2)}
${s.isReset ? 'RESET' : s}
${s.ansi}example\x1b[m
${code}original\x1b[m
${acc.ansi}acc\x1b[m ${acc}
`,
        String(i).padStart(3, '0'),
      )
    }
    i++
  }

  t.end()
})

t.test('from props object', t => {
  const props: StyleProps[] = [
    {},
    { href: 'https://izs.me' },
    { href: 'https://izs.me', color: 'brightblue' },
    { href: '', color: 'green' },
    {
      href: `!#@$!@23

This is not a valid URL!!`,
      background: 'magenta',
    },
    { color: 'BRIGHTRED' },
  ]
  for (const p of props) {
    const s = new Style(p)
    t.matchSnapshot(inspect(s, { colors: true }))
    t.matchSnapshot(inspect(s, { colors: false }))
    t.matchSnapshot(s.wrap('x'), 'wrap in html tag')
  }
  t.end()
})
