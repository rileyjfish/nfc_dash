import type { FacilityListItem } from '@/lib/types'
import FacilityMapClient from '@/components/map/FacilityMapClient'
import { getFacilitiesList } from '@/lib/queries/facilities'

export default async function MapPage() {
  let loadError: string | null = null
  let facilities: FacilityListItem[] = []

  try {
    facilities = await getFacilitiesList()
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
        <h1 className="text-3xl font-semibold">Facility Map</h1>
        <p className="text-gray-600 mt-2">
          Marker colors follow facility category. Data source is facilities joined to site coordinates.
        </p>
      </header>

      <FacilityMapClient
        facilities={facilities}
        maptilerKey={process.env.NEXT_PUBLIC_MAPTILER_KEY}
      />
    </main>
  )
}
