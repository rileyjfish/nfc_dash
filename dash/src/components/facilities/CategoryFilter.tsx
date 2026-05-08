'use client'

import { useState } from 'react'
import type { StatusGroup } from '@/lib/types'

interface CategoryFilterProps {
  byCategory: Record<string, Record<StatusGroup, number>>
}

const DISPLAY_CATEGORIES: { label: string; key: string }[] = [
  { label: 'Reactors', key: 'reactor' },
  { label: 'Uranium Mills', key: 'frontend' },
  { label: 'Fuel Processing', key: 'fuel_processing' },
  { label: 'HL Waste Management', key: 'backend' },
]

const STATUS_OPTIONS: { value: StatusGroup; label: string }[] = [
  { value: 'operating', label: 'Operating' },
  { value: 'shutdown', label: 'Shutdown' },
  { value: 'planned', label: 'Planned' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function CategoryFilter({ byCategory }: CategoryFilterProps) {
  const [status, setStatus] = useState<StatusGroup>('operating')

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xl font-semibold">Units by Category</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusGroup)}
          className="border rounded px-2 py-1 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DISPLAY_CATEGORIES.map(({ label, key }) => {
          const count = byCategory[key]?.[status] ?? 0
          return (
            <li key={key} className="rounded border px-3 py-2 flex items-center justify-between">
              <span>{label}</span>
              <strong>{count}</strong>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
