import { createFileRoute } from '@tanstack/react-router'
import { SolarSystem } from '#/components/SolarSystem'
import { Timeline } from '#/components/Timeline/Timeline'
import { TimelineProvider } from '#/store/timeline'
import { useState, useEffect } from 'react'

function SolarSystemPage() {
    const [settings, setSettings] = useState<{ start: number; end: number } | null>(null)

    useEffect(() => {
        const start = new Date('2000-01-01').getTime()
        const end = new Date('2050-01-01').getTime()
        setSettings({ start, end })
    }, [])

    if (!settings) return null

    return (
        <TimelineProvider settings={settings} defaultGranularity="week">
            <SolarSystem />
            <Timeline />
        </TimelineProvider>
    )
}

export const Route = createFileRoute('/solar-system')({
    component: SolarSystemPage,
})