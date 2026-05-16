import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Trip } from '../types/trip'
import { apiClient } from '../lib/api'

export const TripDetailHeader = ({ trip }: { trip: Trip }) => {
  const [exportDate, setExportDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [saveLog, setSaveLog] = useState<boolean>(false)
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')

  const handleExport = async () => {
    try {
      const resp = await apiClient.get(`/trips/${trip.id}/export_log/`, {
        params: { date: exportDate, save: saveLog ? 'true' : 'false', format },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([resp.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `trip_${trip.id}_log_${exportDate}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed', err)
      alert('Failed to export log')
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate/70">Trip #{trip.id}</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {trip.pickup_location} → {trip.dropoff_location}
        </h1>
        <p className="text-sm text-slate">ETA {trip.eta ? new Date(trip.eta).toLocaleString() : 'TBD'}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={exportDate}
          onChange={(e) => setExportDate(e.target.value)}
          className="rounded-md border px-2 py-1 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={saveLog} onChange={(e) => setSaveLog(e.target.checked)} />
          Save to LogSheet
        </label>
        <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-md border px-2 py-1 text-sm">
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>
        <button onClick={handleExport} className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate">
          Export DOT Log
        </button>
        <Link to="/dashboard" className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
