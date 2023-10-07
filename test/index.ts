import t from 'tap'
const { ansiToPre, ansiToAnsi } = await t.mockImport('../src/index.js', {
  '../src/terminal.js': {
    Terminal: class {
      ansi = 'ansi'
      toString() {
        return 'html'
      }
    },
  },
})

t.equal(ansiToPre('input'), 'html')
t.equal(ansiToAnsi('input'), 'ansi')
