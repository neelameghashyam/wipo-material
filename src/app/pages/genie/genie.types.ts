
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
}

// Type aliases for semantic clarity
export type SpeciesDto = SearchResultDto;
export type AuthorityDto = SearchResultDto;

// Filter interfaces
export interface FilterOptions {
  families: string[];
  genera: string[];
  regions: string[];
}

export interface ActiveFilters {
  families: string[];
  genera: string[];
  regions: string[];
  cropTypes: string[];
}