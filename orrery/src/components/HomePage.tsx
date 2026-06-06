import { Link } from "@tanstack/react-router"

const experiments = [
    { path: '/where-are-the-sun-and-moon', label: 'Where are the sun and moon', description: 'Never lose them' },
]

export function HomePage() {
    return (
        <main>
            <h1>Orrery</h1>
            <p>A playground for time, light, distance, planets, and stars.</p>
            <ul>
                {experiments.map((e) => (
                    <li key={e.path}>
                        <Link to={e.path}>{e.label}</Link>
                        <span>{e.description}</span>
                    </li>
                ))}
            </ul>
        </main>
    )
}