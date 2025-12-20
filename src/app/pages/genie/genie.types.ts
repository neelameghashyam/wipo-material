export interface SearchResultDto {
  genieId: string;
  upovCode: string;
  botanicalName?: string;
  commonName?: string;
  family?: string;
  genus?: string;
  region?: string;
  type: 'species' | 'authority';
  updated?: boolean;
  imageUrl?: string;
  fullDetails?: any;
  authorityId?: number;
  name?: string;
  isoCode?: string;
  administrativeWebsite?: string;
  lawWebsite?: string;
  updatedDate?: string;
  createdDate?: string;
}

// Type aliases for semantic clarity
export type SpeciesDto = SearchResultDto;
export type AuthorityDto = SearchResultDto;

// Filter option interface matching the new API structure
export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// Filter interfaces
export interface FilterOptions {
  authorities: FilterOption[];
  families: FilterOption[];
  cropTypes: FilterOption[];
}

export interface ActiveFilters {
  authorities: string[];
  families: string[];
  cropTypes: string[];
}

// API Response interface
export interface FiltersResponse {
  authorities: FilterOption[];
  families: FilterOption[];
  cropTypes: FilterOption[];
}