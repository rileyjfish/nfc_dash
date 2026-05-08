'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { SiteListItem } from '@/lib/types'

type SiteMapProps = {
  sites: SiteListItem[]
  maptilerKey?: string
}

const categoryColorMap: Record<string, string> = {
  frontend: '#059669',
  fuel_processing: '#d97706',
  reactor: '#0284c7',
  backend: '#e11d48',
  uncategorized: '#6b7280',
}

// Priority order for choosing a representative marker color at a multi-unit site
const CATEGORY_PRIORITY = ['reactor', 'fuel_processing', 'backend', 'frontend']

const OPERATING_STATUSES = new Set(['active'])
const SHUTDOWN_STATUSES = new Set(['shutdown', 'decommissioned', 'decommissioning'])

function markerColor(site: SiteListItem): string {
  const nonProposed = site.units.filter((u) => {
    const s = u.facility_status?.toLowerCase() ?? ''
    return OPERATING_STATUSES.has(s) || SHUTDOWN_STATUSES.has(s)
  })
  const cats = nonProposed.map((u) => u.type?.category ?? 'uncategorized')
  for (const priority of CATEGORY_PRIORITY) {
    if (cats.includes(priority)) return categoryColorMap[priority]
  }
  // fall back to any unit category
  const anycat = site.units[0]?.type?.category
  return categoryColorMap[anycat ?? 'uncategorized'] ?? categoryColorMap.uncategorized
}

function statusText(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  if (OPERATING_STATUSES.has(s)) return 'Operating'
  if (SHUTDOWN_STATUSES.has(s)) return 'Shutdown'
  if (s === 'under_construction' || s === 'licensing') return 'Planned'
  if (s === 'cancelled' || s === 'terminated') return 'Cancelled'
  return status ?? '—'
}

function statusColor(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  if (OPERATING_STATUSES.has(s)) return '#059669'
  if (SHUTDOWN_STATUSES.has(s)) return '#4b5563'
  if (s === 'under_construction' || s === 'licensing') return '#0284c7'
  return '#9ca3af'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildPopupHtml(site: SiteListItem): string {
  const siteName = escapeHtml(site.site_name ?? 'Unknown Site')
  const coords = `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}`

  const rowsHtml = site.units
    .map((unit) => {
      const name = escapeHtml(unit.facility_name)
      const label = escapeHtml(unit.type?.label ?? unit.facility_type)
      const sText = escapeHtml(statusText(unit.facility_status))
      const sColor = statusColor(unit.facility_status)
      return `
        <tr>
          <td style="padding: 3px 10px 3px 0; vertical-align: top; white-space: nowrap;">${name}</td>
          <td style="padding: 3px 10px 3px 0; color: #4b5563; vertical-align: top; white-space: nowrap;">${label}</td>
          <td style="padding: 3px 0; color: ${sColor}; vertical-align: top; white-space: nowrap; font-weight: 500;">${sText}</td>
        </tr>`
    })
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; min-width: 240px; max-width: 340px;">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${siteName}</div>
      <div style="font-size: 11px; color: #9ca3af; margin-bottom: 10px;">${coords}</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <th style="text-align: left; color: #9ca3af; font-weight: 500; padding-bottom: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Unit</th>
            <th style="text-align: left; color: #9ca3af; font-weight: 500; padding-bottom: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Type</th>
            <th style="text-align: left; color: #9ca3af; font-weight: 500; padding-bottom: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>`
}

export default function SiteMap({ sites, maptilerKey }: SiteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const style = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
      : 'https://demotiles.maplibre.org/style.json'

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [0, 20],
      zoom: 1.7,
      attributionControl: true,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    const bounds = new maplibregl.LngLatBounds()
    let markerCount = 0

    for (const site of sites) {
      const { latitude, longitude } = site
      if (typeof latitude !== 'number' || typeof longitude !== 'number') continue

      const color = markerColor(site)
      const popup = new maplibregl.Popup({ offset: 18, maxWidth: '360px' }).setHTML(
        buildPopupHtml(site)
      )

      new maplibregl.Marker({ color })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map)

      bounds.extend([longitude, latitude])
      markerCount += 1
    }

    if (markerCount > 0) {
      map.fitBounds(bounds, { padding: 48, maxZoom: 6, duration: 300 })
    }

    return () => {
      map.remove()
    }
  }, [sites, maptilerKey])

  if (sites.length === 0) {
    return (
      <div className="rounded border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No sites available for mapping yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Reactor
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Fuel Processing
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> HL Waste Management
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Uranium Mills
        </span>
      </div>

      <div ref={containerRef} className="h-[68vh] min-h-[460px] w-full rounded border border-gray-200" />

      {!maptilerKey && (
        <p className="text-xs text-gray-500">
          Using public demo map style. Add <code>NEXT_PUBLIC_MAPTILER_KEY</code> for production map tiles.
        </p>
      )}
      <p className="text-xs text-gray-500">
        Click any marker to see all units at that site. Marker color reflects the most prominent unit type.
      </p>
    </div>
  )
}
