'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Map', href: '/map' },
  { label: 'Facilities', href: '/facilities' },
  { label: 'Stats', href: '/stats' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6 px-6 py-3 border-b border-gray-200 bg-white">
      <span className="font-semibold text-sm tracking-wide">NFC Dash</span>
      <ul className="flex items-center gap-4 text-sm">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className={
                pathname === href
                  ? 'font-medium text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
