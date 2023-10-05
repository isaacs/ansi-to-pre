import t from 'tap'
import { namedBright, namedCodes } from '../src/named.js'

t.matchSnapshot({ namedCodes, namedBright })
