// Handling emoji is hard.
// because many/most emoji are 2-character width, give or take,
// but have bizarre line-height and spacing in most fonts, replace emojis
// in the html string with an absolute-position wrapper and 2 spaces for
// them to float above.
// *Some* emojis are 1 character wide, so this ends up being a bit wrong
// sometimes, but better too much space than have things be cut off or
// overlapping, which looks broken.
// Due to limitations of the emoji-regex, some complex emojis will render
// as their constituent parts rather than the conjoined glyph.

import emojiRegex from 'emoji-regex'
const EMOJI_RE = emojiRegex()
const replaceWide = (c: string) => replaceNarrow(c) + ' '
const replaceNarrow = (c: string) =>
  `<span style="position:absolute;line-height:1;margin-top:0.3ex">${c}</span> `
export const fixEmoji = (s: string): string => {
  return s
    .replace(/[\u2500-\u25FF]/g, replaceNarrow)
    .replace(EMOJI_RE, replaceWide)
}
