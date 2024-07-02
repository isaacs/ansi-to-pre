const LINK_RE =
  /\u001b\]8;[^;]*?;(.*?)(?:\u001b\\|\u0007)(.*?)\u001b]8;[^;]*?;(?:\u001b\\|\u0007)/g

// turn ANSI encoded links to HTML hyperlinks
export const hyperlink = (s: string): string => {
  return s.replace(LINK_RE, (_, url, text) => {
    try {
      return `<a href="${new URL(url)}">${text}</a>`
    } catch {
      return text
    }
  })
}
