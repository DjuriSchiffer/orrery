import { useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import { useTimelineState, useTimelineDispatch } from '#/store/timeline'
import { calculateRatioFromGranularity } from '#/utils/time'
import { TimelineSpeedSelector } from './TimelineSpeedSelector'
import { GranularitySelector } from './GranularitySelector'

type Marker = {
    position: number
    color: string
    label?: string
}

type Props = {
    markers?: Marker[]
}

export function Timeline({ markers = [] }: Props) {
    const { time, playing, timelineSpeed, granularity, timelineSettings } = useTimelineState()
    const dispatch = useTimelineDispatch()
    const trackRef = useRef<HTMLDivElement>(null)
    const dragging = useRef(false)

    const handleSeek = (clientX: number) => {
        if (!trackRef.current) return
        const { x, width } = trackRef.current.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (clientX - x) / width))
        const increment = calculateRatioFromGranularity(granularity, timelineSettings)
        const steps = 1 / increment
        dispatch({ type: 'UPDATE_TIME', payload: Math.round(ratio * steps) / steps })
    }

    useEffect(() => {
        const onMove = (e: MouseEvent | TouchEvent) => {
            if (!dragging.current) return
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
            handleSeek(clientX)
        }
        const onUp = () => { dragging.current = false }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
        document.addEventListener('touchmove', onMove)
        document.addEventListener('touchend', onUp)
        return () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
            document.removeEventListener('touchmove', onMove)
            document.removeEventListener('touchend', onUp)
        }
    }, [granularity, timelineSettings])

    useEffect(() => {
        if (playing !== 'play') return
        let rafId: number
        let intervalId: ReturnType<typeof setInterval>

        if (timelineSpeed === 'REAL_TIME') {
            const tick = () => {
                dispatch({ type: 'INTERVAL_TIME' })
                rafId = requestAnimationFrame(tick)
            }
            rafId = requestAnimationFrame(tick)
        } else {
            intervalId = setInterval(() => dispatch({ type: 'INTERVAL_TIME' }), 1000)
        }

        return () => {
            cancelAnimationFrame(rafId)
            clearInterval(intervalId)
        }
    }, [playing, timelineSpeed, dispatch])

    return (
        <nav className="w-full flex flex-row items-center h-10 bg-gray-950 border-t border-gray-800 px-2 gap-2">
            <button
                onClick={() => dispatch({ type: playing === 'play' ? 'PAUSE_TIME' : 'PLAY_TIME' })}
                className="h-6 px-2 rounded bg-indigo-600 hover:bg-indigo-500 border-none flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
                {playing === 'play'
                    ? <Pause size={14} color="white" />
                    : <Play size={14} color="white" />
                }
            </button>

            <div className="relative flex-1 h-full flex items-center">
                <div
                    ref={trackRef}
                    className="relative w-full cursor-pointer"
                    onMouseDown={(e) => { dragging.current = true; handleSeek(e.clientX) }}
                    onTouchStart={(e) => { dragging.current = true; handleSeek(e.touches[0].clientX) }}
                >
                    <div className="w-full h-1 bg-gray-700 rounded" />
                    <div
                        className="absolute top-0 left-0 h-1 bg-indigo-500 rounded pointer-events-none"
                        style={{ width: `${time * 100}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-400 border-2 border-indigo-200 cursor-pointer shadow"
                        style={{ left: `${time * 100}%` }}
                        onMouseDown={(e) => { e.stopPropagation(); dragging.current = true }}
                    />
                    {markers.map((marker, i) => (
                        <div
                            key={i}
                            className="absolute top-1/2 -translate-y-1/2 w-px h-3 opacity-70 pointer-events-none"
                            style={{ left: `${marker.position * 100}%`, backgroundColor: marker.color }}
                        >
                            {marker.label && (
                                <span
                                    className="absolute -top-5 -translate-x-1/2 text-xs whitespace-nowrap"
                                    style={{ color: marker.color }}
                                >
                                    {marker.label}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <TimelineSpeedSelector />
            <GranularitySelector />
        </nav>
    )
}