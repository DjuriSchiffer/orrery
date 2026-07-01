import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { WhereAreTheSunAndMoon } from '#/components/WhereAreTheSunAndMoon'
import { TimelineProvider } from '#/store/timeline'
import { Timeline } from '#/components/Timeline/Timeline'

function SunAndMoonPage() {
    const [settings, setSettings] = useState<{ start: number; end: number } | null>(null)
    const [markers, setMarkers] = useState<{ position: number; color: string; label: string }[]>([])

    useEffect(() => {
        const start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0)
        const end = new Date().setHours(23, 59, 59, 999)
        const total = end - start
        const toRatio = (date: Date) => (date.getTime() - start) / total

        setSettings({ start, end })
        setMarkers([
            { position: toRatio(new Date(2025, 5, 21)), color: '#f97316', label: 'Summer' },
            { position: toRatio(new Date(2025, 11, 21)), color: '#38bdf8', label: 'Winter' },
        ])
    }, [])

    if (!settings) return null

    return (
        <TimelineProvider settings={settings} defaultGranularity="minute">
            <WhereAreTheSunAndMoon />
            <Timeline markers={markers} />
        </TimelineProvider>
    )
}

export const Route = createFileRoute('/where-are-the-sun-and-moon')({
    component: SunAndMoonPage,
})