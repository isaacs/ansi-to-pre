export const rgbToHex = ([r, g, b]: [number, number, number]): string => {
  if (r !== r || g !== g || b !== b) {
    throw new Error('invalid RGB: ' + [r, g, b].join(','))
  }
  return `#${
    Math.max(0, Math.min(r, 255)).toString(16).padStart(2, '0') +
    Math.max(0, Math.min(g, 255)).toString(16).padStart(2, '0') +
    Math.max(0, Math.min(b, 255)).toString(16).padStart(2, '0')
  }`
}
