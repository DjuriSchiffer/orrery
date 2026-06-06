import { useRef, useState, useEffect } from 'react'
import { FastForward } from 'lucide-react'
import { useTimelineState, useTimelineDispatch } from '#/store/timeline'
import type { Granularity } from '#/utils/time'

const GRANULARITIES: Granularity[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year']

export function GranularitySelector() {
  const { granularity } = useTimelineState()
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
    <div ref={ref} className="relative flex items-center justify-center mx-2">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="h-6 px-2 rounded bg-indigo-600 hover:bg-indigo-500 border-none flex items-center justify-center cursor-pointer transition-colors"
      >
        <FastForward size={14} color="white" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-3 flex flex-col gap-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-50">
          {GRANULARITIES.map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer text-white text-sm">
              <input
                type="radio"
                name="granularity"
                value={g}
                checked={granularity === g}
                onChange={() => {
                  dispatch({ type: 'UPDATE_GRANULARITY', payload: g })
                  setIsOpen(false)
                }}
                className="accent-indigo-500"
              />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
