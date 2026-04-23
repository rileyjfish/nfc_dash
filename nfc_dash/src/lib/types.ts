export type FacilityCategory =
  | 'mining_milling'
  | 'conversion'
  | 'enrichment'
  | 'fuel_fabrication'
  | 'power_reactor'
  | 'reprocessing'
  | 'waste_storage'

export type FacilityStatus =
  | 'active'
  | 'decommissioned'
  | 'planned'
  | 'under_construction'

export interface Facility {
  id: string
  name: string
  slug: string
  category: FacilityCategory
  operator: string | null
  country: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  status: FacilityStatus
  description: string | null
  capacity: string | null
  commissioned_year: number | null
  decommissioned_year: number | null
  created_at: string
}

export interface Document {
  id: string
  facility_id: string | null
  title: string
  description: string | null
  file_path: string
  file_type: string | null
  file_size: number | null
  tags: string[] | null
  uploaded_at: string
}

export interface Demographics {
  id: string
  facility_id: string | null
  radius_km: number | null
  population: number | null
  source: string | null
  year: number | null
}

export interface ProductionData {
  id: string
  facility_id: string | null
  year: number | null
  metric_name: string | null
  value: number | null
  unit: string | null
  source: string | null
}

export type Database = {
  public: {
    Tables: {
      facilities: {
        Row: Facility
        Insert: Omit<Facility, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Facility, 'id'>>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'uploaded_at'> & { id?: string; uploaded_at?: string }
        Update: Partial<Omit<Document, 'id'>>
      }
      demographics: {
        Row: Demographics
        Insert: Omit<Demographics, 'id'> & { id?: string }
        Update: Partial<Omit<Demographics, 'id'>>
      }
      production_data: {
        Row: ProductionData
        Insert: Omit<ProductionData, 'id'> & { id?: string }
        Update: Partial<Omit<ProductionData, 'id'>>
      }
    }
  }
}
