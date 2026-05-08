'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { FacilityListItem } from '@/lib/types'

type FacilityMapProps = {
  facilities: FacilityListItem[]
  maptilerKey?: string
}

const categoryColorMap: Record<string, string> = {
  frontend: '#059669',
  fuel_processing: '#d97706',
  reactor: '#0284c7',
  backend: '#e11d48',
  uncategorized: '#6b7280',
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export default function FacilityMap({ facilities, maptilerKey }: FacilityMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

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

    for (const facility of facilities) {
      const latitude = facility.site?.latitude
      const longitude = facility.site?.longitude

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        continue
      }

      const color = categoryColorMap[facility.type?.category ?? 'uncategorized'] ?? categoryColorMap.uncategorized
      const popupHtml = `
        <div style="font-family: Arial, sans-serif; min-width: 210px;">
          <div style="font-weight: 700; margin-bottom: 4px;">${escapeHtml(facility.facility_name)}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 2px;">Type: ${escapeHtml(
            facility.type?.label ?? 'Unknown'
          )}</div>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 8px;">Status: ${escapeHtml(
            facility.facility_status ?? 'Unknown'
          )}</div>
          <a
            href="/facilities/${facility.id}"
            style="display: inline-block; font-size: 12px; color: #111827; text-decoration: underline;"
          >
            Open facility details
          </a>
        </div>
      `

      const popup = new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml)

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
  }, [facilities, maptilerKey])

  if (facilities.length === 0) {
    return (
      <div className="rounded border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No facilities available for mapping yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Frontend
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Fuel processing
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Reactor
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Backend
        </span>
      </div>

      <div ref={containerRef} className="h-[68vh] min-h-[460px] w-full rounded border border-gray-200" />

      {!maptilerKey ? (
        <p className="text-xs text-gray-500">
          Using public demo map style. Add <code>NEXT_PUBLIC_MAPTILER_KEY</code> for production map tiles.
        </p>
      ) : null}

      <p className="text-xs text-gray-500">
        Click any marker to open a popup with facility details and a quick link.
      </p>
    </div>
  )
}
