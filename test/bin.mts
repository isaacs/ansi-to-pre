import { Minipass } from 'minipass'
import { resolve } from 'node:path'
import t from 'tap'
import * as FS from 'node:fs'

t.test('bin tests', async t => {
  const exits = t.capture(process, 'exit').args
  const errs = t.capture(console, 'error').args
  const logs = t.capture(console, 'log').args

  // ensure that they're either empty (and no tests for them)
  // or were properly cleared out by the test.
  t.afterEach(() => {
    t.strictSame(exits(), [])
    t.strictSame(errs(), [])
    t.strictSame(logs(), [])
  })

  t.test('usage', async t => {
    t.intercept(process, 'argv', {
      value: [process.execPath, process.argv[1], '-h'],
    })
    await t.mockImport('../dist/esm/bin.mjs')
    t.matchSnapshot(logs()[0]?.[0])
    t.strictSame(exits(), [[0]])
  })

  t.test('no input specified', async t => {
    t.intercept(process, 'argv', {
      value: [process.execPath, process.argv[1], '-i', ''],
    })
    await t.mockImport('../dist/esm/bin.mjs')
    t.strictSame(logs(), [])
    t.strictSame(exits(), [[1]])
    t.strictSame(errs(), [['no input specified']])
  })

  t.test('no output specified', async t => {
    t.intercept(process, 'argv', {
      value: [process.execPath, process.argv[1], '-o', ''],
    })
    await t.mockImport('../dist/esm/bin.mjs')
    t.strictSame(logs(), [])
    t.strictSame(exits(), [[1]])
    t.strictSame(errs(), [['no output specified']])
  })

  t.test('template and tag together', async t => {
    const cases = ['--template-tag=tag', '--template=file']
    t.plan(cases.length)
    for (const c of cases) {
      t.test(c, async t => {
        t.intercept(process, 'argv', {
          value: [process.execPath, process.argv[1], c],
        })
        await t.mockImport('../dist/esm/bin.mjs')
        t.strictSame(logs(), [])
        t.strictSame(errs(), [
          ['template and template-tag must be used together'],
        ])
        t.strictSame(exits(), [[1]])
      })
    }
  })

  t.test('stdin and stdout', async t => {
    const stdin = new Minipass()
    t.intercept(process, 'stdin', { value: stdin })
    const stdout = new Minipass<string>({ encoding: 'utf8' })
    t.intercept(process, 'stdout', { value: stdout })
    await t.mockImport('../dist/esm/bin.mjs')
    stdin.end('blee\x1b[41mblah\x1b[mbloo')
    t.matchSnapshot(await stdout.concat())
  })

  t.test('stdin and stdout with template', async t => {
    const stdin = new Minipass<string>({ encoding: 'utf8' })
    t.intercept(process, 'stdin', { value: stdin })
    const stdout = new Minipass<string>({ encoding: 'utf8' })
    t.intercept(process, 'stdout', { value: stdout })
    const dir = t.testdir({
      template: '<html>{PRE}</html>',
    })
    t.intercept(process, 'argv', {
      value: [
        process.execPath,
        process.argv[1],
        `--template=${resolve(dir, 'template')}`,
        '--template-tag={PRE}',
      ],
    })
    await t.mockImport('../dist/esm/bin.mjs')
    stdin.end('blee\x1b[41mblah\x1b[mbloo')
    t.matchSnapshot(await stdout.concat())
  })

  t.test('ansi in, ansi out', async t => {
    const input = '\x1b[41mred red red red red\x1b[44mblue\x1b[10Dblue'
    const expect =
      '\x1b]8;;\x1b\\\x1b[0;48;2;255;0;0mred red red r' +
      '\x1b]8;;\x1b\\\x1b[0;48;2;0;64;224mblue' +
      '\x1b]8;;\x1b\\\x1b[0;48;2;255;0;0med' +
      '\x1b]8;;\x1b\\\x1b[0;48;2;0;64;224mblue' +
      '\x1b[m'

    const stdin = new Minipass()
    t.intercept(process, 'stdin', { value: stdin })
    const stdout = new Minipass<string>({ encoding: 'utf8' })
    t.intercept(process, 'stdout', { value: stdout })
    t.intercept(process, 'argv', {
      value: [process.execPath, process.argv[1], '--format=ansi'],
    })
    await t.mockImport('../dist/esm/bin.mjs')
    stdin.end(input)
    t.equal(await stdout.concat(), expect)
  })

  t.test('input/output files', async t => {
    const dir = t.testdir({
      input: '\x1b[41mred red red red red\x1b[44mblue\x1b[10Dblue',
    })
    const output = new Minipass<string>({ encoding: 'utf8' })

    const expect =
      '\x1b]8;;\x1b\\\x1b[0;48;2;255;0;0mred red red r' +
      '\x1b]8;;\x1b\\\x1b[0;48;2;0;64;224mblue' +
      '\x1b]8;;\x1b\\\x1b[0;48;2;255;0;0med' +
      '\x1b]8;;\x1b\\\x1b[0;48;2;0;64;224mblue' +
      '\x1b[m'

    t.intercept(process, 'argv', {
      value: [
        process.execPath,
        process.argv[1],
        '--format=ansi',
        '-i',
        dir + '/input',
        '-o',
        dir + '/output',
      ],
    })
    await t.mockImport('../dist/esm/bin.mjs', {
      fs: t.createMock(FS, {
        createWriteStream: () => output,
      }),
    })
    t.equal(await output.concat(), expect)
  })
})
