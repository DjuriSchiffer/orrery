import { useTimelineState } from '#/store/timeline'
import { calculateDateFromRatio } from '#/utils/time'
import { useState } from 'react'

function getTrailPath(
    cx: number,
    cy: number,
    orbitR: number,
    currentAngleDeg: number,
    trailDeg: number = 45
): string {
    const points = 60
    return Array.from({ length: points }, (_, i) => {
        const angle = ((currentAngleDeg - trailDeg + (i * trailDeg) / points) * Math.PI) / 180
        const x = cx + orbitR * Math.cos(angle)
        const y = cy + orbitR * Math.sin(angle)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
}

const PLANETS = [
    { name: 'Mercury', color: '#b5b5b5', period: 87.97, size: 4, startAngle: 174.8 },
    { name: 'Venus', color: '#e8cda0', period: 224.7, size: 6, startAngle: 50.4 },
    { name: 'Earth', color: '#4fa3e0', period: 365.25, size: 7, startAngle: 100.5 },
    { name: 'Mars', color: '#c1440e', period: 686.97, size: 5, startAngle: 355.4 },
    { name: 'Jupiter', color: '#c88b3a', period: 4332.59, size: 14, startAngle: 34.4 },
    { name: 'Saturn', color: '#e4d191', period: 10759.2, size: 12, startAngle: 49.9 },
    { name: 'Uranus', color: '#7de8e8', period: 30688.5, size: 10, startAngle: 313.2 },
    { name: 'Neptune', color: '#4b70dd', period: 60182.0, size: 10, startAngle: 304.9 },
]

const EPOCH = new Date('2000-01-01').getTime()

export function SolarSystem() {
    const [hovered, setHovered] = useState<string | null>(null)
    const { time, timelineSettings } = useTimelineState()
    const currentDate = new Date(calculateDateFromRatio(timelineSettings, time).timestamp)
    const daysSinceEpoch = (currentDate.getTime() - EPOCH) / (1000 * 60 * 60 * 24)

    const size = 600
    const cx = size / 2
    const cy = size / 2
    const sunRadius = 18
    const minOrbit = 50
    const orbitStep = (cx - minOrbit - 20) / PLANETS.length

    return (
        <div className="h-[calc(100vh-2.5rem)] bg-gray-950 text-white flex flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-gray-500">
                    {currentDate.toLocaleDateString('en-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xl flex-1 min-h-0">

                {/* orbit rings */}
                {PLANETS.map((_, i) => (
                    <circle key={i} cx={cx} cy={cy} r={minOrbit + i * orbitStep} fill="none" stroke="#1f2937" strokeWidth="1" />
                ))}

                {/* trails */}
                {PLANETS.map((planet, i) => {
                    const orbitR = minOrbit + i * orbitStep
                    const angleDeg = planet.startAngle + (daysSinceEpoch / planet.period) * 360
                    return (
                        <path
                            key={`trail-${planet.name}`}
                            d={getTrailPath(cx, cy, orbitR, angleDeg, 60)}
                            fill="none"
                            stroke={planet.color}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.3"
                        />
                    )
                })}

                {/* sun */}
                <circle cx={cx} cy={cy} r={sunRadius} fill="#facc15" />

                {/* planets */}
                {PLANETS.map((planet, i) => {
                    const orbitR = minOrbit + i * orbitStep
                    const angleDeg = planet.startAngle + (daysSinceEpoch / planet.period) * 360
                    const angleRad = (angleDeg * Math.PI) / 180
                    const x = cx + orbitR * Math.cos(angleRad)
                    const y = cy + orbitR * Math.sin(angleRad)
                    const tooltipX = x > cx ? x + planet.size + 8 : x - planet.size - 118
                    const tooltipY = Math.min(y - 20, size - 60)

                    return (
                        <g
                            key={planet.name}
                            onMouseEnter={() => setHovered(planet.name)}
                            onMouseLeave={() => setHovered(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            <circle cx={x} cy={y} r={planet.size + 8} fill="transparent" />
                            {planet.name === 'Saturn' && (
                                <g transform={`translate(${x}, ${y})`}>
                                    <ellipse rx={planet.size * 2.2} ry={planet.size * 0.6} fill="none" stroke="#c8a84b" strokeWidth="2.5" opacity="0.6" />
                                    <ellipse rx={planet.size * 1.7} ry={planet.size * 0.45} fill="none" stroke="#e4d191" strokeWidth="1.5" opacity="0.4" />
                                </g>
                            )}
                            <circle cx={x} cy={y} r={planet.size} fill={planet.color} />
                            {hovered === planet.name && (
                                <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                                    <rect x={0} y={0} width={110} height={52} rx={4} fill="#111827" stroke="#374151" strokeWidth="1" />
                                    <text x={8} y={16} fill={planet.color} fontSize="11" fontWeight="500">{planet.name}</text>
                                    <text x={8} y={30} fill="#6b7280" fontSize="10">Period: {planet.period.toLocaleString()}d</text>
                                    <text x={8} y={44} fill="#6b7280" fontSize="10">Angle: {(angleDeg % 360).toFixed(1)}°</text>
                                </g>
                            )}
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}