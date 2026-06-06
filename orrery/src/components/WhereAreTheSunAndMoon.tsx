import { useEffect, useState } from 'react'
import * as SunCalc from 'suncalc'
import { useTimelineState } from '#/store/timeline'
import { calculateDateFromRatio } from '#/utils/time'
import { HorizonArcView } from './HorizonArcView'

export function WhereAreTheSunAndMoon() {
    const [mounted, setMounted] = useState(false)
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
    const [sunPos, setSunPos] = useState<{ azimuth: number; altitude: number } | null>(null)

    const { time, timelineSettings } = useTimelineState()
    const currentDate = new Date(calculateDateFromRatio(timelineSettings, time).timestamp)

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude
                const lng = pos.coords.longitude
                setCoords({ lat, lng })
            },
            (err) => console.error('Geolocation error:', err),
            { timeout: 10000, enableHighAccuracy: true }
        )
    }, [])

    useEffect(() => {
        if (!coords) return
        const pos = SunCalc.getPosition(currentDate, coords.lat, coords.lng)
        setSunPos({ azimuth: pos.azimuth, altitude: pos.altitude })
    }, [coords, currentDate.getTime()])

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const azimuthDeg = sunPos ? (sunPos.azimuth * 180) / Math.PI + 180 : null
    const altitudeDeg = sunPos ? (sunPos.altitude * 180) / Math.PI : null
    const isAboveHorizon = altitudeDeg !== null && altitudeDeg > 0

    const moonPos = coords ? SunCalc.getMoonPosition(currentDate, coords.lat, coords.lng) : null
    const moonIllumination = SunCalc.getMoonIllumination(currentDate)
    const moonAzimuthDeg = moonPos ? (moonPos.azimuth * 180) / Math.PI + 180 : 0
    const moonAltitudeDeg = moonPos ? (moonPos.altitude * 180) / Math.PI : 0
    const moonIsAboveHorizon = moonAltitudeDeg > 0

    const moonPhaseEmoji = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
    const phaseIndex = Math.round(moonIllumination.phase * 8) % 8

    const size = 400
    const cx = size / 2
    const cy = size / 2
    const r = 100

    const altitudeRatio = altitudeDeg !== null
        ? altitudeDeg >= 0 ? Math.min(altitudeDeg / 90, 1) : Math.max(altitudeDeg / 90, -1)
        : 0
    const sunR = r * (1 - altitudeRatio)
    const sunX = azimuthDeg !== null ? cx + sunR * Math.sin((azimuthDeg * Math.PI) / 180) : null
    const sunY = azimuthDeg !== null ? cy - sunR * Math.cos((azimuthDeg * Math.PI) / 180) : null

    const moonAltitudeRatio = moonAltitudeDeg >= 0
        ? Math.min(moonAltitudeDeg / 90, 1)
        : Math.max(moonAltitudeDeg / 90, -1)
    const moonR = r * (1 - moonAltitudeRatio)
    const moonX = cx + moonR * Math.sin((moonAzimuthDeg * Math.PI) / 180)
    const moonY = cy - moonR * Math.cos((moonAzimuthDeg * Math.PI) / 180)

    return (
        <div className="min-h-[calc(100vh-2.5rem)] bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">

            <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-500">
                    {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'waiting for location...'}
                </p>
                <p className="text-sm text-gray-400">
                    {currentDate.toLocaleDateString('en-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-5xl font-bold tabular-nums tracking-tight">
                    {currentDate.toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-3xl">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm">
                    <circle cx={cx} cy={cy} r={r + 40} fill="none" stroke="#374151" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth="1" />
                    <text x={cx} y={cy - r - 16} textAnchor="middle" fill="#6b7280" fontSize="13">N</text>
                    <text x={cx} y={cy + r + 24} textAnchor="middle" fill="#6b7280" fontSize="13">S</text>
                    <text x={cx + r + 20} y={cy + 5} textAnchor="middle" fill="#6b7280" fontSize="13">E</text>
                    <text x={cx - r - 20} y={cy + 5} textAnchor="middle" fill="#6b7280" fontSize="13">W</text>
                    {sunX !== null && sunY !== null && (
                        <circle cx={sunX} cy={sunY} r={10} fill={isAboveHorizon ? '#facc15' : '#374151'} />
                    )}
                    {coords && (
                        <circle cx={moonX} cy={moonY} r={7} fill={moonIsAboveHorizon ? '#e2e8f0' : '#374151'} />
                    )}
                    <circle cx={cx} cy={cy} r={4} fill="#4b5563" />
                </svg>
                <HorizonArcView coords={coords} />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="flex flex-col gap-1 bg-gray-900 border border-gray-800 rounded px-4 py-3">
                    <p className="text-xs font-medium text-gray-400">☀️ Sun</p>
                    <p className="text-sm text-white">Azimuth: {azimuthDeg?.toFixed(1)}°</p>
                    <p className="text-sm text-white">Altitude: {altitudeDeg?.toFixed(1)}°</p>
                    <p className={`text-xs ${isAboveHorizon ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {isAboveHorizon ? 'Above horizon' : 'Below horizon'}
                    </p>
                </div>
                <div className="flex flex-col gap-1 bg-gray-900 border border-gray-800 rounded px-4 py-3">
                    <p className="text-xs font-medium text-gray-400">{moonPhaseEmoji[phaseIndex]} Moon</p>
                    <p className="text-sm text-white">Azimuth: {moonAzimuthDeg.toFixed(1)}°</p>
                    <p className="text-sm text-white">Altitude: {moonAltitudeDeg.toFixed(1)}°</p>
                    <p className={`text-xs ${moonIsAboveHorizon ? 'text-slate-300' : 'text-gray-500'}`}>
                        {moonIsAboveHorizon ? 'Above horizon' : 'Below horizon'}
                    </p>
                    <p className="text-xs text-gray-500">{(moonIllumination.fraction * 100).toFixed(0)}% illuminated</p>
                </div>
            </div>
        </div>
    )
}