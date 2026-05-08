import Link from 'next/link'
import { notFound } from 'next/navigation'
import TypeBadge from '@/components/facilities/TypeBadge'
import { getDocumentsBySiteId, getSiteDetailById } from '@/lib/queries/facilities'
import type { SiteDetailItem, SiteDocumentItem } from '@/lib/types'

type SiteDetailPageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value: string | null) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString()
}

function statusLabel(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  if (s === 'active') return 'Operating'
  if (s === 'shutdown' || s === 'decommissioned' || s === 'decommissioning') return 'Shutdown'
  if (s === 'under_construction' || s === 'licensing') return 'Planned'
  if (s === 'cancelled' || s === 'terminated') return 'Cancelled'
  return status ?? '—'
}

function statusColor(status: string | null): string {
  const s = status?.toLowerCase() ?? ''
  if (s === 'active') return 'text-green-700'
  if (s === 'shutdown' || s === 'decommissioned' || s === 'decommissioning') return 'text-gray-600'
  if (s === 'under_construction' || s === 'licensing') return 'text-sky-700'
  if (s === 'cancelled' || s === 'terminated') return 'text-red-600'
  return 'text-gray-500'
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { id } = await params

  let site: SiteDetailItem | null = null
  let documents: SiteDocumentItem[] = []
  let loadError: string | null = null

  try {
    const [siteResult, docsResult] = await Promise.all([
      getSiteDetailById(id),
      getDocumentsBySiteId(id),
    ])
    site = siteResult
    documents = docsResult
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Unknown error'
  }

  if (loadError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Failed to load site</h1>
        <pre>{loadError}</pre>
      </main>
    )
  }

  if (!site) {
    notFound()
  }

  return (
    <main className="p-8">
      <Link href="/sites" className="text-sm underline">
        Back to sites
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="text-3xl font-semibold">{site.site_name ?? 'Unnamed Site'}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
        </p>
        {site.notes && (
          <p className="mt-2 text-sm text-gray-700">{site.notes}</p>
        )}
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          Facilities{' '}
          <span className="text-base font-normal text-gray-500">({site.units.length})</span>
        </h2>
        {site.units.length === 0 ? (
          <p className="text-sm text-gray-600">No facilities recorded for this site.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Capacity</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">End</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {site.units.map((unit) => (
                  <tr key={unit.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{unit.facility_name}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <TypeBadge category={unit.type?.category} />
                        <span className="text-gray-600">{unit.type?.label ?? unit.facility_type}</span>
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${statusColor(unit.facility_status)}`}>
                      {statusLabel(unit.facility_status)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {unit.capacity !== null && unit.capacity_unit
                        ? `${unit.capacity} ${unit.capacity_unit}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(unit.start_operation)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(unit.end_operation)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/facilities/${unit.id}`}
                        className="text-xs text-sky-700 underline whitespace-nowrap"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Documentation{' '}
          <span className="text-base font-normal text-gray-500">({documents.length})</span>
        </h2>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-600">No documents linked to facilities at this site.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Filename</th>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((row) => (
                  <tr key={`${row.document_id}-${row.facility_id}`} className="border-t border-gray-100">
                    <td className="px-4 py-3">{row.document?.filename ?? row.document_id}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.document?.path ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {row.document?.created_at
                        ? new Date(row.document.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
