import { useEffect, useState } from 'react'
import { apiClient } from '../lib/api'

type LogSheet = {
  id: number
  date: string
  pdf_file?: string | null
  thumbnail?: string | null
  graph_data?: any
  remarks?: string
}

export const LogSheetList = ({ tripId }: { tripId: number }) => {
  const [sheets, setSheets] = useState<LogSheet[]>([])
  const [loading, setLoading] = useState(false)
  const [next, setNext] = useState<string | null>(null)

  const load = async (url?: string) => {
    setLoading(true)
    try {
      const fetchUrl = url ?? `/trips/${tripId}/log-sheets/`
      const { data } = await apiClient.get(fetchUrl)
      // support paginated responses
      if (data.results) {
        setSheets((prev) => [...prev, ...data.results])
        setNext(data.next)
      } else {
        setSheets(Array.isArray(data) ? data : [])
        setNext(null)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load logs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSheets([])
    load()
  }, [tripId])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this log?')) return
    try {
      await apiClient.delete(`/trips/${tripId}/log-sheets/${id}/`)
      setSheets((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete failed', err)
      alert('Failed to delete log')
    }
  }

  if (loading && !sheets.length) return <p>Loading logs…</p>
  if (!sheets.length) return <p>No saved logs for this trip.</p>

  return (
    <div className="space-y-2">
      {sheets.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="text-sm font-medium">{s.date}</div>
            <div className="text-xs text-slate">{s.remarks}</div>
          </div>
          <div className="flex items-center gap-2">
            {s.thumbnail ? (
              <img src={s.thumbnail} alt={`thumb-${s.id}`} className="h-12 w-24 object-cover rounded" />
            ) : s.pdf_file ? (
              <a href={s.pdf_file} className="text-sm text-blue-600" target="_blank" rel="noreferrer">Download PDF</a>
            ) : (
              <span className="text-sm text-slate">No PDF</span>
            )}
            <button className="text-sm text-red-500" onClick={() => handleDelete(s.id)}>Delete</button>
          </div>
        </div>
      ))}
      {next && (
        <div className="text-center">
          <button onClick={() => load(next)} className="rounded px-3 py-1 text-sm border">Load more</button>
        </div>
      )}
    </div>
  )
}

export default LogSheetList
