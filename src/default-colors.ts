let COLOR = '#eeeeee'
let BACKGROUND = '#222222'

export const defaultColor = (s?: string) => {
  if (s) COLOR = s
  return COLOR
}

export const defaultBackground = (s?: string) => {
  if (s) BACKGROUND = s
  return BACKGROUND
}
