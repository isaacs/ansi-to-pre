import t from 'tap'
import { defaultBackground, defaultColor } from '../src/default-colors.js'

t.matchSnapshot({ bg: defaultBackground(), fg: defaultColor() })

defaultBackground('#ffffff')
defaultColor('#000000')

t.matchSnapshot(
  { bg: defaultBackground(), fg: defaultColor() },
  'after change',
)
