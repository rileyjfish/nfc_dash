import { supabase } from '@/lib/supabase'
import type {
  FacilityDetailItem,
  FacilityDocumentListItem,
  FacilityListItem,
  FacilityOwnershipListItem,
} from '@/lib/types'

export async function getFacilitiesList(): Promise<FacilityListItem[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select(
      `
        id,
        facility_name,
        facility_status,
        capacity,
        capacity_unit,
        start_operation,
        end_operation,
        site:sites!facilities_site_id_fkey (
          id,
          site_name,
          latitude,
          longitude
        ),
        type:facility_types!facilities_facility_type_fkey (
          id,
          label,
          category
        )
      `
    )
    .order('facility_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as FacilityListItem[]
}

export function summarizeFacilities(facilities: FacilityListItem[]) {
  const byCategory: Record<string, number> = {}
  let active = 0
  let planned = 0

  for (const facility of facilities) {
    const status = facility.facility_status?.toLowerCase()
    if (status === 'active') {
      active += 1
    }
    if (status === 'planned') {
      planned += 1
    }

    const category = facility.type?.category ?? 'uncategorized'
    byCategory[category] = (byCategory[category] ?? 0) + 1
  }

  return {
    total: facilities.length,
    active,
    planned,
    byCategory,
  }
}

export async function getFacilityDetailById(id: string): Promise<FacilityDetailItem | null> {
  const { data, error } = await supabase
    .from('facilities')
    .select(
      `
        id,
        facility_name,
        facility_status,
        facility_type,
        proposal_date,
        start_operation,
        end_operation,
        capacity,
        capacity_unit,
        source,
        notes,
        site:sites!facilities_site_id_fkey (
          id,
          site_name,
          latitude,
          longitude,
          notes
        ),
        type:facility_types!facilities_facility_type_fkey (
          id,
          label,
          category
        )
      `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? null) as FacilityDetailItem | null
}

export async function getFacilityOwnershipByFacilityId(
  facilityId: string
): Promise<FacilityOwnershipListItem[]> {
  const { data, error } = await supabase
    .from('facility_ownerships')
    .select(
      `
        id,
        stake,
        stake_unit,
        stake_start,
        stake_end,
        source,
        notes,
        owner:owners!facility_ownerships_owner_id_fkey (
          id,
          owner_name,
          owner_type
        )
      `
    )
    .eq('facility_id', facilityId)
    .order('stake_start', { ascending: true, nullsFirst: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as FacilityOwnershipListItem[]
}

export async function getFacilityDocumentsByFacilityId(
  facilityId: string
): Promise<FacilityDocumentListItem[]> {
  const { data, error } = await supabase
    .from('document_facilities')
    .select(
      `
        document_id,
        document:document_files!document_facilities_document_id_fkey (
          id,
          bucket,
          path,
          filename,
          created_at
        )
      `
    )
    .eq('facility_id', facilityId)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as FacilityDocumentListItem[]
}
