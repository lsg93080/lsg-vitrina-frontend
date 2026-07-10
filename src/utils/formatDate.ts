export const formatDate = (
  dateString: string,
  options: { lang?: string; includeTime?: boolean } = { lang: 'en-US', includeTime: false }
): string => {
  const { lang, includeTime } = options
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
  if (includeTime) {
    dateOptions.hour = '2-digit'
    dateOptions.minute = '2-digit'
  }
  return new Date(dateString).toLocaleDateString(lang, dateOptions)
}
