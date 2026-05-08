import type { FacilityListItem } from '@/lib/types'
import Link from 'next/link'
import TypeBadge from '@/components/facilities/TypeBadge'

type FacilityTableProps = {
  facilities: FacilityListItem[]
}

export default function FacilityTable({ facilities }: FacilityTableProps) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Facility</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Capacity</th>
            <th className="px-4 py-3 font-medium">Site</th>
          </tr>
        </thead>
        <tbody>
          {facilities.map((facility) => (
            <tr key={facility.id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-medium text-gray-900">
                <Link href={`/facilities/${facility.id}`} className="underline">
                  {facility.facility_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-700">{facility.type?.label ?? 'Unknown'}</td>
              <td className="px-4 py-3">
                <TypeBadge category={facility.type?.category} />
              </td>
              <td className="px-4 py-3 text-gray-700">{facility.facility_status ?? 'Unknown'}</td>
              <td className="px-4 py-3 text-gray-700">
                {facility.capacity !== null && facility.capacity_unit
                  ? `${facility.capacity} ${facility.capacity_unit}`
                  : 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-700">{facility.site?.site_name ?? 'Unknown'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
