import * as SunCalc from 'suncalc'
import { useTimelineState } from '#/store/timeline'
import { calculateDateFromRatio } from '#/utils/time'

type Props = {
    coords: { lat: number; lng: number } | null
}

export function HorizonArcView({ coords }: Props) {
    const { time, timelineSettings } = useTimelineState()
    const currentDate = new Date(calculateDateFromRatio(timelineSettings, time).timestamp)

    if (!coords) return <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">Waiting for location...</div>

    const w = 300
    const h = 200
    const padX = 24
    const padY = 20
    const chartW = w - padX * 2
    const chartH = h - padY * 2

    const toSvgX = (az: number) => padX + (az / 360) * chartW
    const toSvgY = (alt: number) => padY + chartH / 2 - (alt / 90) * (chartH / 2)
    const horizonY = toSvgY(0)

    const POINTS = 288

    const buildTrail = (date: Date) =>
        Array.from({ length: POINTS + 1 }, (_, i) => {
            const t = i / POINTS
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
            d.setTime(d.getTime() + t * 86400000)
            const pos = SunCalc.getPosition(d, coords.lat, coords.lng)
            return {
                x: toSvgX((pos.azimuth * 180) / Math.PI + 180),
                y: toSvgY((pos.altitude * 180) / Math.PI),
            }
        })

    const toPath = (trail: { x: number; y: number }[]) =>
        trail.reduce((acc, p, i) => {
            if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
            const prev = trail[i - 1]
            if (Math.abs(p.x - prev.x) > chartW / 2) return acc + ` M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
            return acc + ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
        }, '')

    const currentYear = currentDate.getFullYear()
    const startOfDay = new Date(currentDate)
    startOfDay.setHours(0, 0, 0, 0)

    const sunTrail = buildTrail(startOfDay)
    const summerTrail = buildTrail(new Date(currentYear, 5, 21))
    const winterTrail = buildTrail(new Date(currentYear, 11, 21))

    // current positions
    const sunPos = SunCalc.getPosition(currentDate, coords.lat, coords.lng)
    const sunAz = (sunPos.azimuth * 180) / Math.PI + 180
    const sunAlt = (sunPos.altitude * 180) / Math.PI

    const moonPos = SunCalc.getMoonPosition(currentDate, coords.lat, coords.lng)
    const moonAz = (moonPos.azimuth * 180) / Math.PI + 180
    const moonAlt = (moonPos.altitude * 180) / Math.PI

    const directions = [
        { label: 'N', az: 0 }, { label: 'NE', az: 45 }, { label: 'E', az: 90 },
        { label: 'SE', az: 135 }, { label: 'S', az: 180 }, { label: 'SW', az: 225 },
        { label: 'W', az: 270 }, { label: 'NW', az: 315 },
    ]

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm">
            {/* sky */}
            {/* <rect x={padX} y={padY} width={chartW} height={horizonY - padY} fill="#0f172a" opacity="0.4" rx="4" /> */}
            {/* ground */}
            {/* <rect x={padX} y={horizonY} width={chartW} height={padY + chartH - horizonY} fill="#1e293b" opacity="0.4" rx="4" /> */}

            {/* horizon line */}
            <line x1={padX} y1={horizonY} x2={padX + chartW} y2={horizonY} stroke="#475569" strokeWidth="1" />

            {/* direction ticks */}
            {directions.map(({ label, az }) => (
                <g key={label}>
                    <line x1={toSvgX(az)} y1={horizonY - 4} x2={toSvgX(az)} y2={horizonY + 4} stroke="#475569" strokeWidth="1" />
                    <text x={toSvgX(az)} y={horizonY + 14} textAnchor="middle" fill="#94a3b8" fontSize="8">{label}</text>
                </g>
            ))}

            {/* solstice reference trails */}
            <path d={toPath(summerTrail)} fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 3" />
            <path d={toPath(winterTrail)} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 3" />

            {/* current day trail */}
            <path d={toPath(sunTrail)} fill="none" stroke="#facc15" strokeWidth="2" opacity="0.5" />

            {/* sun dot */}
            <circle cx={toSvgX(sunAz)} cy={toSvgY(sunAlt)} r={8} fill={sunAlt > 0 ? '#facc15' : '#94a3b8'} />

            {/* moon dot */}
            <circle cx={toSvgX(moonAz)} cy={toSvgY(moonAlt)} r={5} fill={moonAlt > 0 ? '#e2e8f0' : '#475569'} />

            {/* altitude labels */}
            <text x={padX - 4} y={toSvgY(45) + 4} textAnchor="end" fill="#475569" fontSize="8">45°</text>
            <text x={padX - 4} y={horizonY + 4} textAnchor="end" fill="#475569" fontSize="8">0°</text>
            <text x={padX - 4} y={toSvgY(-45) + 4} textAnchor="end" fill="#475569" fontSize="8">-45°</text>

            {/* legend */}
            <text x={padX} y={padY - 6} fill="#f97316" fontSize="8">— summer solstice</text>
            <text x={padX + 90} y={padY - 6} fill="#38bdf8" fontSize="8">— winter solstice</text>
        </svg>
    )
}