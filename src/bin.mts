#!/usr/bin/env node

import { createReadStream, createWriteStream, readFileSync } from 'fs'
import { jack } from 'jackspeak'
import { Terminal } from './terminal.js'

const main = async () => {
  const j = jack({})
    .heading('ANSI to PRE - convert and normalize ANSI strings')
    .opt({
      output: {
        short: 'o',
        hint: 'file',
        default: '-',
        description:
          'Where to send results. Set to - to write to stdout (default).',
      },
      input: {
        short: 'i',
        hint: 'file',
        default: '-',
        description:
          'File containing the ANSI stream to parse. Set to - to read from stdin (default).',
      },
      format: {
        short: 'f',
        hint: 'pre|html',
        default: 'pre',
        validate: (v: unknown) => v === 'pre' || v === 'ansi',
        description: `
        Set to 'ansi' to write a normalized ANSI stream.
        Set to 'pre' to putput a \`<pre>\` tag (default).'
      `,
      },
      template: {
        short: 't',
        hint: 'file',
        description: `
        A file containing a template tag to be replaced by the output.
        Useful when inserting html output into a webpage. If set, then
        --template-tag must be set as well, and the template tag must be
        found in the template file.
      `,
      },
      'template-tag': {
        short: 'T',
        hint: 'string',
        description: `
        A string that is replaced in the --template file. Only relevant
        if --template is set.
      `,
      },
    })
    .flag({
      help: {
        short: 'h',
        description: 'print this banner',
      },
    })

  const { values } = j.parse()
  if (values.help) {
    console.log(j.usage())
    return process.exit(0)
  }

  const { input, output, format, template, 'template-tag': tag } = values
  if (!input) {
    console.error('no input specified')
    return process.exit(1)
  }
  if (!output) {
    console.error('no output specified')
    return process.exit(1)
  }

  if ((template && !tag) || (tag && !template)) {
    console.error('template and template-tag must be used together')
    return process.exit(1)
  }

  const out = output === '-' ? process.stdout : createWriteStream(output)
  const inp = input === '-' ? process.stdin : createReadStream(input)

  const chunks: Buffer[] = []
  inp.on('data', data =>
    chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data)),
  )
  inp.on('end', () => {
    const terminal = new Terminal(Buffer.concat(chunks).toString('utf8'))
    const data = format === 'ansi' ? terminal.ansi : terminal.toString()
    out.end(
      template && tag ?
        readFileSync(template, 'utf8').replace(tag, data)
      : data,
    )
  })
}

await main()
