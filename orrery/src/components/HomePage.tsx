import { Link } from "@tanstack/react-router"

const experiments = [
    { path: '/where-are-the-sun-and-moon', label: 'Where are the sun and moon', description: 'Never lose them' },
    { path: '/solar-system', label: 'Solar system', description: 'Yeah...' },
]

export function HomePage() {
    return (
        <main className="min-h-screen bg-gray-950 text-white px-6 py-12 flex flex-col gap-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Orrery</h1>
                <p className="text-gray-400 text-sm">A playground for time, light, distance, planets, and stars.</p>
            </div>

            <ul className="flex flex-col gap-3">
                {experiments.map((e) => (
                    <li key={e.path}>
                        <Link
                            to={e.path}
                            className="flex items-center justify-between px-4 py-3 rounded bg-gray-900 border border-gray-800 hover:border-indigo-500 hover:bg-gray-800 transition-colors group"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{e.label}</span>
                                <span className="text-xs text-gray-500">{e.description}</span>
                            </div>
                            <span className="text-gray-600 group-hover:text-indigo-400 transition-colors text-lg">→</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    )
}