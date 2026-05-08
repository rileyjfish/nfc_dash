import Link from 'next/link'
import FacilityTable from '@/components/facilities/FacilityTable'
import { getFacilitiesList } from '@/lib/queries/facilities'
import type { FacilityListItem } from '@/lib/types'

type SearchParamValue = string | string[] | undefined

type FacilitiesPageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>
}

type SortKey = 'name' | 'type' | 'status' | 'capacity'

function firstValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ?? ''
}

function buildSortLink(
  searchParams: URLSearchParams,
  sort: SortKey,
  currentSort: SortKey,
  currentOrder: 'asc' | 'desc'
) {
  const params = new URLSearchParams(searchParams)
  const isCurrentSort = currentSort === sort
  const nextOrder = isCurrentSort && currentOrder === 'asc' ? 'desc' : 'asc'

  params.set('sort', sort)
  params.set('order', nextOrder)

  const query = params.toString()
  return query ? `/facilities?${query}` : '/facilities'
}

function sortFacilities(
  facilities: FacilityListItem[],
  sortBy: SortKey,
  order: 'asc' | 'desc'
) {
  const sorted = [...facilities].sort((a, b) => {
    if (sortBy === 'capacity') {
      return (a.capacity ?? -1) - (b.capacity ?? -1)
    }

    if (sortBy === 'type') {
      return (a.type?.label ?? '').localeCompare(b.type?.label ?? '')
    }

    if (sortBy === 'status') {
      return (a.facility_status ?? '').localeCompare(b.facility_status ?? '')
    }

    return a.facility_name.localeCompare(b.facility_name)
  })

  if (order === 'desc') {
    sorted.reverse()
  }

  return sorted
}

export default async function FacilitiesPage({ searchParams }: FacilitiesPageProps) {
  const paramsRecord = (await searchParams) ?? {}
  const q = firstValue(paramsRecord.q).trim().toLowerCase()
  const category = firstValue(paramsRecord.category)
  const status = firstValue(paramsRecord.status)

  const parsedSort = firstValue(paramsRecord.sort)
  const sortBy: SortKey =
    parsedSort === 'type' ||
    parsedSort === 'status' ||
    parsedSort === 'capacity' ||
    parsedSort === 'name'
      ? parsedSort
      : 'name'

  const parsedOrder = firstValue(paramsRecord.order)
  const order: 'asc' | 'desc' = parsedOrder === 'desc' ? 'desc' : 'asc'

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
        <h1 className="text-2xl font-semibold mb-4">Failed to load facilities</h1>
        <pre>{loadError}</pre>
      </main>
    )
  }

  const availableCategories = [...new Set(facilities.map((f) => f.type?.category).filter(Boolean))]
  const availableStatuses = [...new Set(facilities.map((f) => f.facility_status).filter(Boolean))]

  const filtered = facilities.filter((facility) => {
    const matchesSearch =
      q.length === 0 ||
      facility.facility_name.toLowerCase().includes(q) ||
      (facility.site?.site_name ?? '').toLowerCase().includes(q) ||
      (facility.type?.label ?? '').toLowerCase().includes(q)

    const matchesCategory = category.length === 0 || facility.type?.category === category
    const matchesStatus = status.length === 0 || facility.facility_status === status

    return matchesSearch && matchesCategory && matchesStatus
  })

  const sorted = sortFacilities(filtered, sortBy, order)

  const currentParams = new URLSearchParams()
  if (q) currentParams.set('q', q)
  if (category) currentParams.set('category', category)
  if (status) currentParams.set('status', status)

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Facilities</h1>
        <p className="text-gray-600 mt-2">Search, filter, and sort across seeded facilities.</p>
      </div>

      <form className="grid gap-3 md:grid-cols-4 mb-6" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, site, or type"
          className="rounded border border-gray-300 px-3 py-2 md:col-span-2"
        />
        <select
          name="category"
          defaultValue={category}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">All categories</option>
          {availableCategories.map((value) => (
            <option key={value} value={value ?? ''}>
              {value?.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">All statuses</option>
          {availableStatuses.map((value) => (
            <option key={value} value={value ?? ''}>
              {value}
            </option>
          ))}
        </select>
        <input type="hidden" name="sort" value={sortBy} />
        <input type="hidden" name="order" value={order} />
        <button
          type="submit"
          className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium w-fit"
        >
          Apply filters
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <span className="text-gray-600">Sort by:</span>
        <Link className="underline" href={buildSortLink(currentParams, 'name', sortBy, order)}>
          Name
        </Link>
        <Link className="underline" href={buildSortLink(currentParams, 'type', sortBy, order)}>
          Type
        </Link>
        <Link className="underline" href={buildSortLink(currentParams, 'status', sortBy, order)}>
          Status
        </Link>
        <Link className="underline" href={buildSortLink(currentParams, 'capacity', sortBy, order)}>
          Capacity
        </Link>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Showing {sorted.length} of {facilities.length} facilities
      </p>

      <FacilityTable facilities={sorted} />
    </main>
  )
}
