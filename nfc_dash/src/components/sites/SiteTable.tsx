'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import type { SiteListItem, SiteUnit } from '@/lib/types'

type SortKey = 'name' | 'operating' | 'shutdown' | 'total'

const OPERATING = new Set(['active'])
const SHUTDOWN = new Set(['shutdown', 'decommissioned', 'decommissioning'])

// Total column count: site + types + op + shut + total + expand chevron
const TOTAL_COLS = 1 + 1 + 3 + 1

const CATEGORY_LABEL: Record<string, string> = {
  reactor: 'Reactor',
  fuel_processing: 'Fuel Processing',
  backend: 'HLW Mgmt',
  frontend: 'Frontend',
}

const CATEGORY_STYLE: Record<string, string> = {
  reactor: 'bg-sky-100 text-sky-800',
  fuel_processing: 'bg-amber-100 text-amber-800',
  backend: 'bg-rose-100 text-rose-800',
  frontend: 'bg-emerald-100 text-emerald-800',
}

function primaryTypes(units: SiteUnit[]): string[] {
  const seen = new Set<string>()
  const order = ['reactor', 'fuel_processing', 'backend', 'frontend']
  for (const cat of order) {
    if (units.some((u) => u.type?.category === cat)) seen.add(cat)
  }
  // include any unlisted categories too
  for (const u of units) {
    const cat = u.type?.category
    if (cat && !seen.has(cat)) seen.add(cat)
  }
  return [...seen]
}

function statusLabel(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  if (OPERATING.has(s)) return 'Operating'
  if (SHUTDOWN.has(s)) return 'Shutdown'
  if (s === 'under_construction' || s === 'licensing') return 'Planned'
  if (s === 'cancelled' || s === 'terminated') return 'Cancelled'
  return status ?? '—'
}

function counts(units: SiteUnit[]) {
  let op = 0
  let shut = 0
  for (const u of units) {
    const s = u.facility_status?.toLowerCase() ?? ''
    if (OPERATING.has(s)) op++
    else if (SHUTDOWN.has(s)) shut++
  }
  return { op, shut, total: units.length }
}

export default function SiteTable({ sites }: { sites: SiteListItem[] }) {
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const sorted = [...sites].sort((a, b) => {
    const ca = counts(a.units)
    const cb = counts(b.units)
    let cmp = 0
    if (sortBy === 'name') cmp = (a.site_name ?? '').localeCompare(b.site_name ?? '')
    else if (sortBy === 'operating') cmp = ca.op - cb.op
    else if (sortBy === 'shutdown') cmp = ca.shut - cb.shut
    else cmp = ca.total - cb.total
    return sortDir === 'asc' ? cmp : -cmp
  })

  function arrow(key: SortKey) {
    if (sortBy !== key) return null
    return <span className="ml-1 text-gray-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-gray-500 uppercase tracking-wide text-xs">
            <th
              className="py-2 pr-6 font-medium text-left cursor-pointer select-none hover:text-gray-900"
              onClick={() => handleSort('name')}
            >
              Site{arrow('name')}
            </th>
            <th className="py-2 pr-6 font-medium text-left">Types</th>
            <th
              className="py-2 pr-4 font-medium text-right cursor-pointer select-none hover:text-gray-900 whitespace-nowrap"
              onClick={() => handleSort('operating')}
            >
              Op{arrow('operating')}
            </th>
            <th
              className="py-2 pr-4 font-medium text-right cursor-pointer select-none hover:text-gray-900 whitespace-nowrap"
              onClick={() => handleSort('shutdown')}
            >
              Shut{arrow('shutdown')}
            </th>
            <th
              className="py-2 pr-4 font-medium text-right cursor-pointer select-none hover:text-gray-900 whitespace-nowrap"
              onClick={() => handleSort('total')}
            >
              Total{arrow('total')}
            </th>
            <th className="py-2 w-4" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((site) => {
            const c = counts(site.units)
            const isOpen = expanded.has(site.id)

            const types = primaryTypes(site.units)

            return (
              <React.Fragment key={site.id}>
                <tr
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggle(site.id)}
                >
                  <td className="py-3 pr-6">
                    <div className="font-medium">{site.site_name ?? '—'}</div>
                    <div className="text-xs text-gray-400">
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </div>
                  </td>
                  <td className="py-3 pr-6">
                    <div className="flex flex-wrap gap-1">
                      {types.map((cat) => (
                        <span
                          key={cat}
                          className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${CATEGORY_STYLE[cat] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          {CATEGORY_LABEL[cat] ?? cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {c.op > 0 ? (
                      <span className="text-green-700 font-medium">{c.op}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {c.shut > 0 ? (
                      <span className="text-gray-600 font-medium">{c.shut}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right font-medium">{c.total}</td>
                  <td className="py-3 text-center text-gray-400 text-xs">
                    {isOpen ? '▲' : '▼'}
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan={TOTAL_COLS} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500">{site.units.length} unit{site.units.length !== 1 ? 's' : ''}</span>
                        <Link
                          href={`/sites/${site.id}`}
                          className="text-xs text-sky-700 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Details &amp; Documentation →
                        </Link>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 uppercase tracking-wide border-b">
                            <th className="pb-2 pr-6 font-medium text-left">Unit</th>
                            <th className="pb-2 pr-6 font-medium text-left">Type</th>
                            <th className="pb-2 font-medium text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {site.units.map((unit) => (
                            <tr key={unit.id} className="border-b last:border-0">
                              <td className="py-1.5 pr-6">{unit.facility_name}</td>
                              <td className="py-1.5 pr-6 text-gray-600">
                                {unit.type?.label ?? unit.facility_type}
                              </td>
                              <td className="py-1.5 text-gray-600">
                                {statusLabel(unit.facility_status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
