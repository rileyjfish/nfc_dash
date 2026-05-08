import { supabase } from '@/lib/supabase'
import type {
  FacilityDetailItem,
  FacilityDocumentListItem,
  FacilityListItem,
  FacilityOwnershipListItem,
  SiteDetailItem,
  SiteDocumentItem,
  SiteListItem,
  StatusGroup,
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

const STATUS_MAP: Record<StatusGroup, string[]> = {
  operating: ['active'],
  shutdown: ['shutdown', 'decommissioned', 'decommissioning'],
  planned: ['under_construction', 'licensing'],
  cancelled: ['cancelled', 'terminated'],
}

export function resolveStatusGroup(status: string | null): StatusGroup | null {
  const s = status?.toLowerCase() ?? ''
  for (const [group, values] of Object.entries(STATUS_MAP) as [StatusGroup, string[]][]) {
    if (values.includes(s)) return group
  }
  return null
}

export function summarizeFacilities(facilities: FacilityListItem[]) {
  const byCategory: Record<string, Record<StatusGroup, number>> = {}
  let active = 0
  let planned = 0

  for (const facility of facilities) {
    const statusGroup = resolveStatusGroup(facility.facility_status)
    if (statusGroup === 'operating') active += 1
    if (statusGroup === 'planned') planned += 1

    const category = facility.type?.category ?? 'uncategorized'
    if (!byCategory[category]) {
      byCategory[category] = { operating: 0, shutdown: 0, planned: 0, cancelled: 0 }
    }
    if (statusGroup) {
      byCategory[category][statusGroup] += 1
    }
  }

  return {
    total: facilities.length,
    active,
    planned,
    byCategory,
  }
}

export async function getSitesList(): Promise<SiteListItem[]> {
  const { data, error } = await supabase
    .from('sites')
    .select(
      `
        id,
        site_name,
        latitude,
        longitude,
        notes,
        units:facilities (
          id,
          facility_name,
          facility_status,
          facility_type,
          type:facility_types!facilities_facility_type_fkey (
            id,
            label,
            category
          )
        )
      `
    )
    .order('site_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as SiteListItem[]
}

export async function getSiteCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sites')
    .select('*', { count: 'exact', head: true })

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
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

export async function getSiteDetailById(id: string): Promise<SiteDetailItem | null> {
  const { data, error } = await supabase
    .from('sites')
    .select(
      `
        id,
        site_name,
        latitude,
        longitude,
        notes,
        units:facilities (
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
          type:facility_types!facilities_facility_type_fkey (
            id,
            label,
            category
          )
        )
      `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? null) as SiteDetailItem | null
}

export async function getDocumentsBySiteId(siteId: string): Promise<SiteDocumentItem[]> {
  const { data: facilityData, error: facilityError } = await supabase
    .from('facilities')
    .select('id')
    .eq('site_id', siteId)

  if (facilityError) {
    throw new Error(facilityError.message)
  }

  const facilityIds = (facilityData ?? []).map((f) => f.id)
  if (facilityIds.length === 0) return []

  const { data, error } = await supabase
    .from('document_facilities')
    .select(
      `
        document_id,
        facility_id,
        document:document_files!document_facilities_document_id_fkey (
          id,
          bucket,
          path,
          filename,
          created_at
        )
      `
    )
    .in('facility_id', facilityIds)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as SiteDocumentItem[]
}
