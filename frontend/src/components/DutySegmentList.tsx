import { useEffect, useState } from 'react'
import { apiClient } from '../lib/api'

type DutySegment = {
  id: number
  status: string
  start_time: string
  end_time: string
  duration_hours: number
  remarks?: string
}

type DutySegmentListProps = {
  tripId: number
  refreshTrigger?: number
}

export const DutySegmentList = ({ tripId, refreshTrigger }: DutySegmentListProps) => {
  const [segments, setSegments] = useState<DutySegment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSegments = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get(`/trips/${tripId}/duty-segments/`)
      setSegments(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError('Failed to load duty segments')
      console.error('Failed to load duty segments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSegments()
  }, [tripId, refreshTrigger])

  if (loading && !segments.length) {
    return <p className="text-sm text-slate">Loading duty segments…</p>
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  if (!segments.length) {
    return <p className="text-sm text-slate">No duty segments recorded yet.</p>
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving':
        return 'text-blue-400'
      case 'on_duty':
        return 'text-yellow-400'
      case 'sleeper_berth':
        return 'text-green-400'
      case 'off_duty':
        return 'text-slate'
      default:
        return 'text-white'
    }
  }

  return (
    <div className="space-y-3">
      {segments.map((segment) => (
        <div key={segment.id} className="rounded-2xl border border-white/5 bg-black/50 px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold ${getStatusColor(segment.status)}`}>
                {segment.status.replaceAll('_', ' ')}
              </p>
              <p className="text-xs text-slate">
                {formatTime(segment.start_time)} – {formatTime(segment.end_time)}
              </p>
              <p className="text-xs text-slate/70">{segment.duration_hours} hrs</p>
              {segment.remarks && <p className="mt-1 text-xs text-slate/80">{segment.remarks}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
