'use client'

import dynamic from 'next/dynamic'
import type { FacilityListItem } from '@/lib/types'

type FacilityMapClientProps = {
  facilities: FacilityListItem[]
  maptilerKey?: string
}

const FacilityMap = dynamic(() => import('@/components/map/FacilityMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[68vh] min-h-[460px] w-full rounded border border-gray-200 bg-gray-50 animate-pulse" />
  ),
})

export default function FacilityMapClient({ facilities, maptilerKey }: FacilityMapClientProps) {
  return <FacilityMap facilities={facilities} maptilerKey={maptilerKey} />
}
