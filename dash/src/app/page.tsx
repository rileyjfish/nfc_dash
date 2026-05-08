import { getFacilitiesList, getSiteCount, summarizeFacilities } from '@/lib/queries/facilities'
import type { FacilityListItem } from '@/lib/types'
import CategoryFilter from '@/components/facilities/CategoryFilter'

export default async function Home() {
  let facilities: FacilityListItem[] = []
  let siteCount = 0
  let loadError: string | null = null

  try {
    ;[facilities, siteCount] = await Promise.all([getFacilitiesList(), getSiteCount()])
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Unknown error'
  }

  if (loadError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Supabase connection failed</h1>
        <pre>{loadError}</pre>
      </main>
    )
  }

  const summary = summarizeFacilities(facilities)

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">NFC Dashboard</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Sites</h2>
          <p className="text-3xl font-semibold mt-2">{siteCount}</p>
        </article>
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Units</h2>
          <p className="text-3xl font-semibold mt-2">{summary.total}</p>
        </article>
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Active Units</h2>
          <p className="text-3xl font-semibold mt-2">{summary.active}</p>
        </article>
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Planned Units</h2>
          <p className="text-3xl font-semibold mt-2">{summary.planned}</p>
        </article>
      </section>

      <CategoryFilter byCategory={summary.byCategory} />

      <section>
        <h2 className="text-xl font-semibold mb-3">Units</h2>
        <ul className="space-y-2">
          {facilities.map((facility) => (
            <li key={facility.id} className="rounded border p-3">
              <div className="font-semibold">{facility.facility_name}</div>
              <div className="text-sm text-gray-600">Type: {facility.type?.label ?? facility.type?.id ?? 'Unknown'}</div>
              <div className="text-sm text-gray-600">Status: {facility.facility_status ?? 'Unknown'}</div>
              <div className="text-sm text-gray-600">
                Site: {facility.site?.site_name ?? 'Unknown'}
              </div>
              <div className="text-sm text-gray-600">
                Coordinates: {facility.site?.latitude ?? 'N/A'}, {facility.site?.longitude ?? 'N/A'}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}