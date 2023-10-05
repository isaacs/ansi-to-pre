import t from 'tap'
import { DEFAULT_BG, DEFAULT_FG } from '../src/default-colors.js'
t.matchSnapshot({ DEFAULT_BG, DEFAULT_FG })
