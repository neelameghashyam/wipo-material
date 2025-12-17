import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { debounceTime, distinctUntilChanged, map, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Footer } from "../../shared/footer/footer";
import { Header } from "../../shared/header/header";

interface FilterOptions {
  families: string[];
  genera: string[];
  regions: string[];
  authorities: string[];
}

interface ActiveFilters {
  families: string[];
  genera: string[];
  regions: string[];
  authorities: string[];
  cropTypes: string[];
}

export interface SpeciesDto {
  genieId: string;
  upovCode: string;
  botanicalName?: string;
  commonName?: string;
  family?: string;
  genus?: string;
  region?: string;
  type?: 'species' | 'authority';
  updated?: boolean;
  imageUrl?: string;
  fullDetails?: any;
  // Authority specific fields
  authorityId?: number;
  name?: string;
  isoCode?: string;
  administrativeWebsite?: string;
  lawWebsite?: string;
}

@Component({
  selector: 'app-genie',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSelectModule,
    MatSidenavModule,
    MatRadioModule,
    Footer,
    Header
  ],
  templateUrl: './genie.html',
  styleUrl: './genie.scss',
})
export class Genie implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';
  
  searchControl = new FormControl('');
  searchTypeControl = new FormControl('species');
  searchResults: SpeciesDto[] = [];
  selectedSpecies: SpeciesDto | null = null;
  showAutocomplete = false;
  showResults = false;
  showPageDropdown = false;
  showFilters = false;
  latestSpecies: SpeciesDto[] = [];
  
  isSearching = false;
  totalResults = 0;
  currentPage = 1;
  itemsPerPage = 15;

  // Filter options
  filterOptions: FilterOptions = {
    families: [],
    genera: [],
    regions: [],
    authorities: []
  };

  // Active filters
  activeFilters: ActiveFilters = {
    families: [],
    genera: [],
    regions: [],
    authorities: [],
    cropTypes: []
  };

  // Filter search
  filterSearchControl = new FormControl('');
  filteredFamilies: string[] = [];
  filteredGenera: string[] = [];
  filteredRegions: string[] = [];
  filteredAuthorities: string[] = [];

  ngOnInit() {
    this.setupSearchListener();
    this.loadLatestSpecies();
    this.setupFilterSearch();
  }

  setupFilterSearch() {
    this.filterSearchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(query => {
        const searchTerm = query?.toLowerCase() || '';
        this.filteredFamilies = this.filterOptions.families.filter(f => 
          f.toLowerCase().includes(searchTerm)
        );
        this.filteredGenera = this.filterOptions.genera.filter(g => 
          g.toLowerCase().includes(searchTerm)
        );
        this.filteredRegions = this.filterOptions.regions.filter(r => 
          r.toLowerCase().includes(searchTerm)
        );
        this.filteredAuthorities = this.filterOptions.authorities.filter(a => 
          a.toLowerCase().includes(searchTerm)
        );
      });
  }

  loadLatestSpecies() {
    this.http.get<any>(`${this.API_BASE_URL}/species?page=0&pageSize=6`)
      .pipe(
        catchError(error => {
          console.error('Error loading latest species:', error);
          this.snackBar.open('Error loading latest species', 'Close', { duration: 3000 });
          return of({ species: [] });
        })
      )
      .subscribe(response => {
        this.latestSpecies = (response.species || []).map((item: any) => ({
          genieId: item.genieId.toString(),
          upovCode: item.upovCode,
          botanicalName: item.botanicalName || item.defaultName,
          commonName: '',
          family: '',
          genus: '',
          region: '',
          type: 'species',
          updated: true,
          imageUrl: ''
        }));
      });
  }

  setupSearchListener() {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        map(query => {
          if (!query || query.trim().length < 2) {
            this.showAutocomplete = false;
            this.showResults = false;
            return [];
          }
          
          this.isSearching = true;
          this.showAutocomplete = true;
          
          this.performSearch(query);
          
          return [];
        })
      )
      .subscribe();

    this.searchTypeControl.valueChanges.subscribe(() => {
      const currentValue = this.searchControl.value;
      if (currentValue && currentValue.length >= 2) {
        this.searchControl.setValue(currentValue);
      }
      this.resetFilters();
    });
  }

  performSearch(query: string): void {
    const searchType = this.searchTypeControl.value;
    const searchQuery = query.trim();
    
    if (searchType === 'species') {
      this.http.get<any[]>(`${this.API_BASE_URL}/species/search?q=${encodeURIComponent(searchQuery)}`)
        .pipe(
          catchError(error => {
            console.error('Error searching species:', error);
            this.snackBar.open('Error searching species', 'Close', { duration: 3000 });
            this.isSearching = false;
            return of([]);
          })
        )
        .subscribe(response => {
          let results: SpeciesDto[] = (response || []).map((item: any) => ({
            genieId: item.genieId.toString(),
            upovCode: item.upovCode,
            botanicalName: item.botanicalName || item.defaultName,
            commonName: '',
            family: '',
            genus: '',
            region: '',
            type: 'species',
            updated: false,
            imageUrl: ''
          }));
          
          results = this.applyFilters(results);
          
          this.searchResults = results;
          this.totalResults = results.length;
          this.isSearching = false;
          
          this.filterOptions.families = [];
          this.filterOptions.genera = [];
          this.filteredFamilies = [];
          this.filteredGenera = [];
        });
    } else {
      // API call for authorities search
      this.http.get<any[]>(`${this.API_BASE_URL}/authority/search?q=${encodeURIComponent(searchQuery)}`)
        .pipe(
          catchError(error => {
            console.error('Error searching authorities:', error);
            this.snackBar.open('Error searching authorities', 'Close', { duration: 3000 });
            this.isSearching = false;
            return of([]);
          })
        )
        .subscribe(response => {
          let results: SpeciesDto[] = (response || []).map((item: any) => ({
            genieId: item.authorityId.toString(),
            upovCode: item.isoCode || '-',
            botanicalName: item.name,
            commonName: '',
            family: '',
            genus: '',
            region: '',
            type: 'authority',
            updated: false,
            imageUrl: this.getFlagUrl(item.isoCode),
            // Store authority specific data
            authorityId: item.authorityId,
            name: item.name,
            isoCode: item.isoCode,
            administrativeWebsite: item.administrativeWebsite,
            lawWebsite: item.lawWebsite
          }));

          results = this.applyFilters(results);
          
          this.searchResults = results;
          this.totalResults = results.length;
          this.isSearching = false;

          // Update filter options for authorities
          this.filterOptions.authorities = [...new Set(results.map(a => a.name).filter(Boolean))].sort() as string[];
          this.filteredAuthorities = this.filterOptions.authorities;
        });
    }
  }

  getFlagUrl(isoCode: string | undefined): string {
    if (!isoCode || isoCode === '-' || isoCode.length !== 2) {
      return '';
    }
    return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
  }

  applyFilters(data: SpeciesDto[]): SpeciesDto[] {
    let filtered = data;

    if (this.activeFilters.families.length > 0) {
      filtered = filtered.filter(item => 
        this.activeFilters.families.includes(item.family || '')
      );
    }

    if (this.activeFilters.genera.length > 0) {
      filtered = filtered.filter(item => 
        this.activeFilters.genera.includes(item.genus || '')
      );
    }

    if (this.activeFilters.regions.length > 0) {
      filtered = filtered.filter(item => 
        this.activeFilters.regions.includes(item.region || '')
      );
    }

    if (this.activeFilters.authorities.length > 0) {
      filtered = filtered.filter(item => 
        this.activeFilters.authorities.includes(item.name || '')
      );
    }

    return filtered;
  }

  toggleFilter(filterType: keyof ActiveFilters, value: string) {
    const filterArray = this.activeFilters[filterType];
    const index = filterArray.indexOf(value);
    if (index === -1) {
      filterArray.push(value);
    } else {
      filterArray.splice(index, 1);
    }
    this.applyFiltersToResults();
  }

  applyFiltersToResults() {
    const query = this.searchControl.value;
    if (query && query.length >= 2) {
      this.performSearch(query);
      this.currentPage = 1;
    }
  }

  resetFilters() {
    this.activeFilters = {
      families: [],
      genera: [],
      regions: [],
      authorities: [],
      cropTypes: []
    };
    this.applyFiltersToResults();
  }

  getActiveFilterCount(): number {
    return this.activeFilters.families.length + 
           this.activeFilters.genera.length + 
           this.activeFilters.regions.length +
           this.activeFilters.authorities.length +
           this.activeFilters.cropTypes.length;
  }

  removeFilter(filterType: keyof ActiveFilters, value: string) {
    const filterArray = this.activeFilters[filterType];
    const index = filterArray.indexOf(value);
    if (index !== -1) {
      filterArray.splice(index, 1);
      this.applyFiltersToResults();
    }
  }

  selectSpecies(species: SpeciesDto) {
    if (species.type === 'species') {
      this.http.get<any>(`${this.API_BASE_URL}/species/${species.genieId}`)
        .pipe(
          catchError(error => {
            console.error('Error loading species details:', error);
            this.snackBar.open('Error loading species details', 'Close', { duration: 3000 });
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.selectedSpecies = {
              genieId: response.genieId.toString(),
              upovCode: response.upovCode,
              botanicalName: response.botanicalName,
              commonName: response.names?.commonNames?.en || '',
              family: response.family || '',
              genus: '',
              region: '',
              type: 'species',
              updated: false,
              imageUrl: '',
              fullDetails: response
            };
            this.searchControl.setValue(response.upovCode);
            this.showAutocomplete = false;
          }
        });
    } else {
      // For authorities, fetch full details from API
      this.http.get<any>(`${this.API_BASE_URL}/authority/${species.authorityId}`)
        .pipe(
          catchError(error => {
            console.error('Error loading authority details:', error);
            this.snackBar.open('Error loading authority details', 'Close', { duration: 3000 });
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.selectedSpecies = {
              genieId: response.authorityId.toString(),
              upovCode: response.isoCode || '-',
              botanicalName: response.name,
              commonName: '',
              family: '',
              genus: '',
              region: '',
              type: 'authority',
              updated: false,
              imageUrl: this.getFlagUrl(response.isoCode),
              authorityId: response.authorityId,
              name: response.name,
              isoCode: response.isoCode,
              administrativeWebsite: response.administrativeWebsite,
              lawWebsite: response.lawWebsite,
              fullDetails: response
            };
            this.searchControl.setValue(response.name);
            this.showAutocomplete = false;
          }
        });
    }
  }

  onSearchSubmit() {
    const query = this.searchControl.value?.trim();
    if (query && query.length >= 2) {
      this.showAutocomplete = false;
      this.showResults = true;
      
      if (this.searchResults.length > 0) {
        console.log('Search submitted:', query, 'Results:', this.totalResults);
      }
    }
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.searchResults = [];
    this.selectedSpecies = null;
    this.showAutocomplete = false;
    this.showResults = false;
    this.totalResults = 0;
    this.showFilters = false;
    this.resetFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  shouldShowResultsHeader(): boolean {
    if (!this.showResults) return false;
    
    const hasFiltersApplied = this.getActiveFilterCount() > 0;
    const isSpeciesSearch = this.searchTypeControl.value === 'species';
    
    if (this.totalResults > 0) return true;
    
    if (hasFiltersApplied && isSpeciesSearch) return false;
    
    return false;
  }

  shouldShowFiltersButton(): boolean {
    if (!this.showResults) return false;
    
    const hasFiltersApplied = this.getActiveFilterCount() > 0;
    
    if (this.totalResults > 0) return true;
    
    if (hasFiltersApplied) return true;
    
    return false;
  }

  shouldShowEmptyState(): boolean {
    return this.showResults && this.totalResults === 0;
  }

  shouldShowPagination(): boolean {
    return this.showResults && this.totalResults > 0 && this.getTotalPages() > 1;
  }

  hideAutocomplete() {
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 200);
  }

  getPaginatedResults(): SpeciesDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.searchResults.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalResults / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number | '...') {
    if (typeof page === 'number') {
      this.changePage(page);
    }
  }

  getPageNumbers(): (number | '...')[] {
    const total = this.getTotalPages();
    const current = this.currentPage;
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (current > 4) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 3) {
      pages.push('...');
    }

    pages.push(total);

    return pages;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  togglePageDropdown() {
    this.showPageDropdown = !this.showPageDropdown;
  }

  goToPageFromDropdown(page: number) {
    this.changePage(page);
    this.showPageDropdown = false;
  }

  getAllPages(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  getSuggestionForTypo(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery === 'brasca') {
      return 'brassica';
    }
    return null;
  }

  applySuggestion(suggestion: string) {
    this.searchControl.setValue(suggestion);
    this.onSearchSubmit();
  }

  getAuthorityWebsite(item: SpeciesDto): string {
    return item.administrativeWebsite || '-';
  }

  getAuthorityLawWebsite(item: SpeciesDto): string {
    return item.lawWebsite || '-';
  }

  getAuthorityName(item: SpeciesDto): string {
    return item.name || '-';
  }

  getAuthorityIsoCode(item: SpeciesDto): string {
    return item.isoCode || '-';
  }
}