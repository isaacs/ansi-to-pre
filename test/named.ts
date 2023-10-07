import t from 'tap'
import { namedBrightColors, namedColors } from '../src/named.js'

t.matchSnapshot({ namedColors, namedBrightColors })
