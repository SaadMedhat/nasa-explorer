import { format, parseISO, isValid } from "date-fns"

const DISPLAY_FORMAT = "dd MMMM yyyy" as const
const API_FORMAT = "yyyy-MM-dd" as const

export const formatDisplayDate = (dateString: string): string => {
  const parsed = parseISO(dateString)
  if (!isValid(parsed)) {
    return dateString
  }
  return format(parsed, DISPLAY_FORMAT)
}

export const formatApiDate = (date: Date): string => {
  if (!isValid(date)) {
    return ""
  }
  return format(date, API_FORMAT)
}

export const isValidDateString = (dateString: string): boolean => {
  const parsed = parseISO(dateString)
  return isValid(parsed)
}
