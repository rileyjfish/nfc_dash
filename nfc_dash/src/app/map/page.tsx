import type { SiteListItem } from '@/lib/types'
import SiteMapClient from '@/components/map/SiteMapClient'
import { getSitesList } from '@/lib/queries/facilities'

export default async function MapPage() {
  let loadError: string | null = null
  let sites: SiteListItem[] = []

  try {
    sites = await getSitesList()
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Unknown error'
  }

  if (loadError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Failed to load map data</h1>
        <pre>{loadError}</pre>
      </main>
    )
  }

  return (
    <main className="p-8">
      <header className="mb-5">
        <h1 className="text-3xl font-semibold">Site Map</h1>
        <p className="text-gray-600 mt-2">
          One marker per site. Click a marker to see all units at that site.
        </p>
      </header>

      <SiteMapClient
        sites={sites}
        maptilerKey={process.env.NEXT_PUBLIC_MAPTILER_KEY}
      />
    </main>
  )
}
