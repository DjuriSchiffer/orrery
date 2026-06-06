// Time constants in seconds
export const TIME = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 86400 * 7,
  MONTH: 86400 * (365 / 12),
  YEAR: 86400 * 365,
} as const

export const MS = {
  SECOND: 1000,
  DAY: 86400 * 1000,
} as const

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const

export type Granularity = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export type TimelineSettings = {
  start: number // timestamp ms
  end: number   // timestamp ms
}

export type DateInfo = {
  year: number
  monthNumber: number
  month: typeof MONTH_NAMES[number]
  week: number
  dayNumber: number
  dayOfWeek: typeof DAY_NAMES[number]
  hours: number
  minutes: number
  seconds: number
  timestamp: number
}

function getWeekNumber(inputDate: Date): number {
  const date = new Date(inputDate)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 4 - (date.getDay() || 7))
  const yearStart = new Date(date.getFullYear(), 0, 1)
  return Math.ceil(((date.getTime() - yearStart.getTime()) / MS.DAY + 1) / 7)
}

export function calculateDateFromRatio(settings: TimelineSettings, ratio: number): DateInfo {
  const timestamp = settings.start + Math.floor(ratio * (settings.end - settings.start))
  const date = new Date(timestamp)
  return {
    year: date.getFullYear(),
    monthNumber: date.getMonth() + 1,
    month: MONTH_NAMES[date.getMonth()],
    week: getWeekNumber(date),
    dayNumber: date.getDate(),
    dayOfWeek: DAY_NAMES[date.getDay()],
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    timestamp,
  }
}

export function getTotalDays(settings: TimelineSettings): number {
  return (settings.end - settings.start) / MS.DAY
}

export function calculateOneSecondRatio(settings: TimelineSettings): number {
  const totalSeconds = (settings.end - settings.start) / MS.SECOND
  return totalSeconds > 0 ? 1 / totalSeconds : 0
}

export function calculateRatioFromGranularity(granularity: Granularity, settings: TimelineSettings): number {
  const oneSecond = calculateOneSecondRatio(settings)
  const multiplier = TIME[granularity.toUpperCase() as keyof typeof TIME]
  if (multiplier === undefined) throw new Error(`Invalid granularity: ${granularity}`)
  return oneSecond * multiplier
}
