import { useRef, useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useTimelineState, useTimelineDispatch } from '#/store/timeline'
import type { TimelineSpeed } from '#/store/timeline'

const SPEEDS: { value: TimelineSpeed; label: string }[] = [
  { value: 'REAL_TIME', label: 'Smooth' },
  { value: 'ONE_SECOND', label: 'Step' },
]

export function TimelineSpeedSelector() {
  const { timelineSpeed } = useTimelineState()
  const dispatch = useTimelineDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="h-6 px-2 rounded bg-indigo-600 hover:bg-indigo-500 border-none flex items-center justify-center cursor-pointer transition-colors"
      >
        <Clock size={14} color="white" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-3 flex flex-col gap-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-50">
          {SPEEDS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer text-white text-sm">
              <input
                type="radio"
                name="timelineSpeed"
                value={value}
                checked={timelineSpeed === value}
                onChange={() => {
                  dispatch({ type: 'UPDATE_TIMELINE_SPEED', payload: value })
                  setIsOpen(false)
                }}
                className="accent-indigo-500"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
