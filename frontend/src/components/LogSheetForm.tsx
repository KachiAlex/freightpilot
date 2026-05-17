import { useState } from 'react'
import { apiClient } from '../lib/api'
import toast from 'react-hot-toast'

type LogSheetFormProps = {
  tripId: number
  onSuccess?: () => void
}

export const LogSheetForm = ({ tripId, onSuccess }: LogSheetFormProps) => {
  const [date, setDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await apiClient.post(`/trips/${tripId}/log-sheets/`, {
        date,
      })

      toast.success('Log sheet generated successfully')
      setDate('')
      setErrors({})

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate log sheet'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = date && !errors.date

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div>
        <label className="block text-sm font-medium text-slate">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white placeholder-slate focus:border-sky focus:outline-none"
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className="w-full rounded-lg bg-sky px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate/30"
      >
        {loading ? 'Generating…' : 'Generate Log Sheet'}
      </button>
    </form>
  )
}
