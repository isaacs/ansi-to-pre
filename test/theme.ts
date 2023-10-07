import t from 'tap'
import { defaultBackground, defaultColor } from '../src/default-colors.js'
import { nameCodes, namedBrightColors, namedColors } from '../src/named.js'
import { theme } from '../src/theme.js'
import { xtermCode } from '../src/xterm.js'

t.matchSnapshot(theme(), 'return current theme if no args')

theme({
  // https://en.wikipedia.org/wiki/Solarized#Colors
  defaultColor: '#eee8d5',
  defaultBackground: '#073642',
  named: {
    black: '#002b36',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#fdf6e3',
  },
  bright: {
    black: '#586e75',
    red: '#ff0000',
    green: '#00ff00',
    yellow: '#ffff00',
    blue: '#0000ff',
    magenta: '#ff00ff',
    cyan: '#00ffff',
    white: '#ffffff',
  },
})

t.matchSnapshot(theme(), 'after update')
t.equal(defaultColor(), '#eee8d5')
t.equal(defaultBackground(), '#073642')
t.equal(namedColors[nameCodes.black], '#002b36')
t.equal(namedBrightColors[nameCodes.black], '#586e75')
t.equal(namedBrightColors[nameCodes.white], '#ffffff')
t.equal(xtermCode(1), '#dc322f')
