import t from 'tap'
import { fixEmoji } from '../src/fix-emoji.js'

t.matchSnapshot(
  fixEmoji(`
some string with 😅 emoji 💩🌭👨🏻‍❤️‍💋‍👨🏾and lines ━━┛
`),
)
