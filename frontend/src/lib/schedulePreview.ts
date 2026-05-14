import type { RestPreferences } from '../types/trip'

type PreviewSegment = {
  label: string
  status: 'driving' | 'rest' | 'sleeper'
  start: Date
  end: Date
}

export const defaultRestPreferences: RestPreferences = {
  drive_block_hours: 4,
  break_minutes: 30,
  second_drive_hours: 3,
  sleeper_hours: 10,
}

const hoursToMs = (hours: number) => hours * 60 * 60 * 1000
const minutesToMs = (minutes: number) => minutes * 60 * 1000

export const buildRestPreview = (start: Date, preferences: RestPreferences): PreviewSegment[] => {
  const driveBlock = new Date(start.getTime() + hoursToMs(preferences.drive_block_hours))
  const breakEnd = new Date(driveBlock.getTime() + minutesToMs(preferences.break_minutes))
  const secondDriveEnd = new Date(breakEnd.getTime() + hoursToMs(preferences.second_drive_hours))
  const sleeperEnd = new Date(secondDriveEnd.getTime() + hoursToMs(preferences.sleeper_hours))

  return [
    { label: 'Drive block', status: 'driving', start, end: driveBlock },
    { label: 'Rest stop', status: 'rest', start: driveBlock, end: breakEnd },
    { label: 'Second drive block', status: 'driving', start: breakEnd, end: secondDriveEnd },
    { label: 'Sleeper reset', status: 'sleeper', start: secondDriveEnd, end: sleeperEnd },
  ]
}

export const formatPreviewSegment = (segment: PreviewSegment) => {
  return {
    ...segment,
    startLabel: segment.start.toLocaleString(),
    endLabel: segment.end.toLocaleString(),
  }
}
