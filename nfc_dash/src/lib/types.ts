export type FacilityTypeCategory = 'frontend' | 'fuel_processing' | 'reactor' | 'backend'

export interface FacilityType {
  id: string
  label: string
  category: FacilityTypeCategory
}

export interface Site {
  id: string
  site_name: string | null
  latitude: number
  longitude: number
  parent_site_id: string | null
  notes: string | null
  created_at: string
}

export interface Facility {
  id: string
  site_id: string | null
  facility_name: string
  facility_type: string
  facility_status: string | null
  proposal_date: string | null
  start_operation: string | null
  end_operation: string | null
  capacity: number | null
  capacity_unit: string | null
  parent_facility_id: string | null
  source: string | null
  notes: string | null
  created_at: string
}

export interface Owner {
  id: string
  owner_name: string
  owner_type: string | null
  notes: string | null
  created_at: string
}

export interface FacilityOwnership {
  id: string
  facility_id: string
  owner_id: string
  stake: number | null
  stake_unit: string | null
  stake_start: string | null
  stake_end: string | null
  source: string | null
  notes: string | null
}

export interface DocumentFile {
  id: string
  bucket: string
  path: string
  filename: string | null
  created_at: string
}

export interface DocumentFacility {
  document_id: string
  facility_id: string
}

export interface MineLocation {
  id: string
  mine_name: string | null
  latitude: number
  longitude: number
  mine_type: string | null
  facility_status: string | null
  proposal_date: string | null
  start_operation: string | null
  end_operation: string | null
  capacity: number | null
  capacity_unit: string | null
  source: string | null
  notes: string | null
  created_at: string
}

export interface FacilityListItem {
  id: string
  facility_name: string
  facility_status: string | null
  capacity: number | null
  capacity_unit: string | null
  start_operation: string | null
  end_operation: string | null
  site: Pick<Site, 'id' | 'site_name' | 'latitude' | 'longitude'> | null
  type: Pick<FacilityType, 'id' | 'label' | 'category'> | null
}

export interface FacilityDetailItem {
  id: string
  facility_name: string
  facility_status: string | null
  facility_type: string
  proposal_date: string | null
  start_operation: string | null
  end_operation: string | null
  capacity: number | null
  capacity_unit: string | null
  source: string | null
  notes: string | null
  site: Pick<Site, 'id' | 'site_name' | 'latitude' | 'longitude' | 'notes'> | null
  type: Pick<FacilityType, 'id' | 'label' | 'category'> | null
}

export interface FacilityOwnershipListItem {
  id: string
  stake: number | null
  stake_unit: string | null
  stake_start: string | null
  stake_end: string | null
  source: string | null
  notes: string | null
  owner: Pick<Owner, 'id' | 'owner_name' | 'owner_type'> | null
}

export interface FacilityDocumentListItem {
  document_id: string
  document: DocumentFile | null
}

export type Database = {
  public: {
    Tables: {
      facility_types: {
        Row: FacilityType
        Insert: FacilityType
        Update: Partial<FacilityType>
      }
      sites: {
        Row: Site
        Insert: Omit<Site, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Site, 'id'>>
      }
      facilities: {
        Row: Facility
        Insert: Omit<Facility, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Facility, 'id'>>
      }
      owners: {
        Row: Owner
        Insert: Omit<Owner, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Owner, 'id'>>
      }
      facility_ownerships: {
        Row: FacilityOwnership
        Insert: Omit<FacilityOwnership, 'id'> & { id?: string }
        Update: Partial<Omit<FacilityOwnership, 'id'>>
      }
      document_files: {
        Row: DocumentFile
        Insert: Omit<DocumentFile, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<DocumentFile, 'id'>>
      }
      document_facilities: {
        Row: DocumentFacility
        Insert: DocumentFacility
        Update: Partial<DocumentFacility>
      }
      mine_locations: {
        Row: MineLocation
        Insert: Omit<MineLocation, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<MineLocation, 'id'>>
      }
    }
  }
}
