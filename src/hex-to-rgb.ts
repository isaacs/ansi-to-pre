export const hexToRgb = (c: string): [number, number, number] => {
  c = c.replace(/^#/, '')
  if (c.length === 3) {
    const r = c.charAt(0)
    const g = c.charAt(1)
    const b = c.charAt(2)
    return hexToRgb(`${r}${r}${g}${g}${b}${b}`)
  }
  if (c.length !== 6) {
    throw new Error('invalid hex string: ' + c)
  }
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  if (r !== r || g !== g || b !== b) {
    throw new Error('invalid hex string: ' + c)
  }
  return [r, g, b]
}
