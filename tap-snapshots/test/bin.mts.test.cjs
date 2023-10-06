/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/bin.mts > TAP > bin tests > stdin and stdout > must match snapshot 1`] = `
<pre style="color:#eeeeee;background:#222222;position:relative">blee<span style="background:#ff0000">blah</span>bloo</pre>
`

exports[`test/bin.mts > TAP > bin tests > stdin and stdout with template > must match snapshot 1`] = `
<html><pre style="color:#eeeeee;background:#222222;position:relative">blee<span style="background:#ff0000">blah</span>bloo</pre></html>
`

exports[`test/bin.mts > TAP > bin tests > usage > must match snapshot 1`] = `
ANSI to PRE - convert and normalize ANSI strings
Usage:
  bin.mts -h --o=<file> --i=<file> --f=<pre|html> --t=<file> --T=<string>

  -o<file> --output=<file>
             Where to send results. Set to - to write to stdout (default).

  -i<file> --input=<file>
             File containing the ANSI stream to parse. Set to - to read from
             stdin (default).

  -f<pre|html> --format=<pre|html>
             Set to 'ansi' to write a normalized ANSI stream. Set to 'pre' to
             putput a \`<pre>\` tag (default).'

  -t<file> --template=<file>
             A file containing a template tag to be replaced by the output.
             Useful when inserting html output into a webpage. If set, then
             --template-tag must be set as well, and the template tag must be
             found in the template file.

  -T<string> --template-tag=<string>
             A string that is replaced in the --template file. Only relevant if
             --template is set.

  -h --help  print this banner
`
