import { getSitesList } from '@/lib/queries/facilities'
import type { SiteListItem } from '@/lib/types'
import SiteTable from '@/components/sites/SiteTable'

export default async function SitesPage() {
  let sites: SiteListItem[] = []
  let loadError: string | null = null

  try {
    sites = await getSitesList()
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Unknown error'
  }

  if (loadError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Failed to load sites</h1>
        <pre>{loadError}</pre>
      </main>
    )
  }

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Sites</h1>
        <p className="text-gray-600 mt-2">{sites.length} sites</p>
      </div>
      <SiteTable sites={sites} />
    </main>
  )
}
