import { getFacilitiesList, summarizeFacilities } from '@/lib/queries/facilities'
import type { FacilityListItem } from '@/lib/types'

export default async function Home() {
  let facilities: FacilityListItem[] = []
  let loadError: string | null = null

  try {
    facilities = await getFacilitiesList()
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
  const categoryRows = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">NFC Dashboard</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Total Facilities</h2>
          <p className="text-3xl font-semibold mt-2">{summary.total}</p>
        </article>
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Active</h2>
          <p className="text-3xl font-semibold mt-2">{summary.active}</p>
        </article>
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Planned</h2>
          <p className="text-3xl font-semibold mt-2">{summary.planned}</p>
        </article>
        <article className="rounded border p-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">Categories</h2>
          <p className="text-3xl font-semibold mt-2">{categoryRows.length}</p>
        </article>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">By Category</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categoryRows.map(([category, count]) => (
            <li key={category} className="rounded border px-3 py-2 flex items-center justify-between">
              <span className="capitalize">{category.replace(/_/g, ' ')}</span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Facilities</h2>
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