/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/block.ts > TAP > blue underlines hyperlink > must match snapshot 1`] = `
<a href="https://izs.me/" style="text-decoration:underline;color:#0040e0">some text</a>
`

exports[`test/block.ts > TAP > blue underlines hyperlink > must match snapshot 2`] = `
]8;;https://izs.me\\[0;38;2;0;64;224;4msome text[m
`

exports[`test/block.ts > TAP > blue underlines hyperlink > must match snapshot 3`] = `
some text
`

exports[`test/block.ts > TAP > blue underlines hyperlink > must match snapshot 4`] = `
Style {}
`

exports[`test/block.ts > TAP > blue underlines hyperlink > must match snapshot 5`] = `
Block { Style { ^[]8;;https://izs.me^[\\^[[0;38;2;0;64;224;4m } 'some text' }
`

exports[`test/block.ts > TAP > blue underlines hyperlink > must match snapshot 6`] = `
Block { Style { ]8;;https://izs.me\\[0;38;2;0;64;224;4m^[]8;;https://izs.me^[\\^[[0;38;2;0;64;224;4m]8;;\\[m } [32m'some text'[39m }
`

exports[`test/block.ts > TAP > empty > must match snapshot 1`] = `

`

exports[`test/block.ts > TAP > empty > must match snapshot 2`] = `

`

exports[`test/block.ts > TAP > empty > must match snapshot 3`] = `

`

exports[`test/block.ts > TAP > empty > must match snapshot 4`] = `
undefined
`

exports[`test/block.ts > TAP > empty > must match snapshot 5`] = `
Block { '' }
`

exports[`test/block.ts > TAP > empty > must match snapshot 6`] = `
Block { [32m''[39m }
`

exports[`test/block.ts > TAP > red and bold > must match snapshot 1`] = `
<span style="font-weight:bold;color:#ff0000">some text</span>
`

exports[`test/block.ts > TAP > red and bold > must match snapshot 2`] = `
]8;;\\[0;38;2;255;0;0;1msome text[m
`

exports[`test/block.ts > TAP > red and bold > must match snapshot 3`] = `
some text
`

exports[`test/block.ts > TAP > red and bold > must match snapshot 4`] = `
Style {}
`

exports[`test/block.ts > TAP > red and bold > must match snapshot 5`] = `
Block { Style { ^[]8;;^[\\^[[0;38;2;255;0;0;1m } 'some text' }
`

exports[`test/block.ts > TAP > red and bold > must match snapshot 6`] = `
Block { Style { ]8;;\\[0;38;2;255;0;0;1m^[]8;;^[\\^[[0;38;2;255;0;0;1m]8;;\\[m } [32m'some text'[39m }
`

exports[`test/block.ts > TAP > unstyled > must match snapshot 1`] = `
some text
`

exports[`test/block.ts > TAP > unstyled > must match snapshot 2`] = `
]8;;\\[0msome text
`

exports[`test/block.ts > TAP > unstyled > must match snapshot 3`] = `
some text
`

exports[`test/block.ts > TAP > unstyled > must match snapshot 4`] = `
undefined
`

exports[`test/block.ts > TAP > unstyled > must match snapshot 5`] = `
Block { 'some text' }
`

exports[`test/block.ts > TAP > unstyled > must match snapshot 6`] = `
Block { [32m'some text'[39m }
`
