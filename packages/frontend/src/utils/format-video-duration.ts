/** `hh:mm:ss` from CMS. Drop a zero hour so the card reads `片長 05:20`. */
export const formatVideoDurationLabel = (value: string) => {
  const match = /^(\d{2}):([0-5]\d):([0-5]\d)$/.exec(value)
  if (!match) return value ? `片長 ${value}` : ''
  const [, hh, mm, ss] = match
  return `片長 ${hh === '00' ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`}`
}
