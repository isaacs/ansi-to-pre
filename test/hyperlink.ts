import t from 'tap'
const str =
  '\x1b]8;id:0;http://example.com\x1b\\This is a link\x1b]8;;\x1b\\ hello \x1b]8;;http://example.com\u0007Another link\x1b]8;;\u0007 \x1b]8;;invalid url\x1b\\invalid link\x1b]8;;\x1b\\ goodbye'

import { hyperlink } from '../src/hyperlink.js'

t.equal(
  hyperlink(str),
  '<a href="http://example.com/">This is a link</a> hello <a href="http://example.com/">Another link</a> invalid link goodbye',
)
