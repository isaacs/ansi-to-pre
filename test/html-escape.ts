import t from 'tap'
import { htmlEscape } from '../src/html-escape.js'

t.matchSnapshot(htmlEscape('<tag style="blah">a & b & c</tag>'))
