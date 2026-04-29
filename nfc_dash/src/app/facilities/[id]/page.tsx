import Link from 'next/link'
import { notFound } from 'next/navigation'
import TypeBadge from '@/components/facilities/TypeBadge'
import {
  getFacilityDetailById,
  getFacilityDocumentsByFacilityId,
  getFacilityOwnershipByFacilityId,
} from '@/lib/queries/facilities'

type FacilityDetailPageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value: string | null) {
  if (!value) {
    return 'N/A'
  }

  return new Date(value).toLocaleDateString()
}

export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const { id } = await params

  let loadError: string | null = null
  let facility = null
  let ownershipRows = []
  let documentRows = []

  try {
    const [facilityResult, ownershipResult, documentResult] = await Promise.all([
      getFacilityDetailById(id),
      getFacilityOwnershipByFacilityId(id),
      getFacilityDocumentsByFacilityId(id),
    ])

    facility = facilityResult
    ownershipRows = ownershipResult
    documentRows = documentResult
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Unknown error'
  }

  if (loadError) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Failed to load facility</h1>
        <pre>{loadError}</pre>
      </main>
    )
  }

  if (!facility) {
    notFound()
  }

  return (
    <main className="p-8">
      <Link href="/facilities" className="text-sm underline">
        Back to facilities
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="text-3xl font-semibold">{facility.facility_name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TypeBadge category={facility.type?.category} />
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
            {facility.facility_status ?? 'Unknown status'}
          </span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 mb-8">
        <article className="rounded border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Core Data</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Type</dt>
              <dd>{facility.type?.label ?? facility.facility_type}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Capacity</dt>
              <dd>
                {facility.capacity !== null && facility.capacity_unit
                  ? `${facility.capacity} ${facility.capacity_unit}`
                  : 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Proposal Date</dt>
              <dd>{formatDate(facility.proposal_date)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Start Operation</dt>
              <dd>{formatDate(facility.start_operation)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">End Operation</dt>
              <dd>{formatDate(facility.end_operation)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Source</dt>
              <dd>{facility.source ?? 'N/A'}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Site</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Name</dt>
              <dd>{facility.site?.site_name ?? 'N/A'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Latitude</dt>
              <dd>{facility.site?.latitude ?? 'N/A'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Longitude</dt>
              <dd>{facility.site?.longitude ?? 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-gray-600 mb-1">Site Notes</dt>
              <dd>{facility.site?.notes ?? 'N/A'}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Ownership History</h2>
        {ownershipRows.length === 0 ? (
          <p className="text-sm text-gray-600">No ownership records available.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Stake</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">End</th>
                </tr>
              </thead>
              <tbody>
                {ownershipRows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{row.owner?.owner_name ?? 'Unknown owner'}</td>
                    <td className="px-4 py-3">{row.owner?.owner_type ?? 'N/A'}</td>
                    <td className="px-4 py-3">
                      {row.stake !== null ? `${row.stake}${row.stake_unit === 'percent' ? '%' : ''}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3">{formatDate(row.stake_start)}</td>
                    <td className="px-4 py-3">{formatDate(row.stake_end)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Related Documents</h2>
        {documentRows.length === 0 ? (
          <p className="text-sm text-gray-600">No related documents yet.</p>
        ) : (
          <ul className="space-y-2">
            {documentRows.map((row) => (
              <li key={row.document_id} className="rounded border border-gray-200 p-3">
                <div className="font-medium">{row.document?.filename ?? row.document?.path ?? 'Untitled document'}</div>
                <div className="text-sm text-gray-600">Bucket: {row.document?.bucket ?? 'N/A'}</div>
                <div className="text-sm text-gray-600">Path: {row.document?.path ?? 'N/A'}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
