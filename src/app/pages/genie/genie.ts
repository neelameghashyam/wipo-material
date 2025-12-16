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
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { Footer } from "../../shared/footer/footer";
import { Header } from "../../shared/header/header";
import { MOCK_SPECIES_DATA, MOCK_AUTHORITIES_DATA, SpeciesDto } from './genie-mock';

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
  
  private allData: SpeciesDto[] = [...MOCK_SPECIES_DATA, ...MOCK_AUTHORITIES_DATA];
  
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
    this.initializeFilterOptions();
    this.setupFilterSearch();
  }

  initializeFilterOptions() {
    const species = this.allData.filter(item => item.type === 'species');
    const authorities = this.allData.filter(item => item.type === 'authority');

    this.filterOptions.families = [...new Set(species.map(s => s.family).filter(Boolean))].sort() as string[];
    this.filterOptions.genera = [...new Set(species.map(s => s.genus).filter(Boolean))].sort() as string[];
    this.filterOptions.regions = [...new Set([...species, ...authorities].map(s => s.region).filter(Boolean))].sort() as string[];
    this.filterOptions.authorities = [...new Set(authorities.map(a => a.botanicalName).filter(Boolean))].sort() as string[];

    this.filteredFamilies = this.filterOptions.families;
    this.filteredGenera = this.filterOptions.genera;
    this.filteredRegions = this.filterOptions.regions;
    this.filteredAuthorities = this.filterOptions.authorities;
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
    this.latestSpecies = this.allData
      .filter(item => item.type === 'species' && item.updated)
      .slice(0, 6);
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
          
          const results = this.performSearch(query);
          
          setTimeout(() => this.isSearching = false, 200);
          return results;
        })
      )
      .subscribe(results => {
        this.searchResults = results;
        this.totalResults = results.length;
      });

    this.searchTypeControl.valueChanges.subscribe(() => {
      const currentValue = this.searchControl.value;
      if (currentValue && currentValue.length >= 2) {
        this.searchControl.setValue(currentValue);
      }
      this.resetFilters();
    });
  }

  performSearch(query: string): SpeciesDto[] {
    const searchType = this.searchTypeControl.value;
    const searchQuery = query.trim().toLowerCase();
    
    let filtered = this.allData.filter(item => {
      if (searchType === 'species' && item.type !== 'species') return false;
      if (searchType === 'authorities' && item.type !== 'authority') return false;
      
      return (
        item.upovCode.toLowerCase().includes(searchQuery) ||
        item.botanicalName?.toLowerCase().includes(searchQuery) ||
        item.commonName?.toLowerCase().includes(searchQuery) ||
        item.genieId.toLowerCase().includes(searchQuery)
      );
    });

    filtered = this.applyFilters(filtered);
    return filtered;
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
        this.activeFilters.authorities.includes(item.botanicalName || '')
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
      this.searchResults = this.performSearch(query);
      this.totalResults = this.searchResults.length;
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
    this.selectedSpecies = species;
    this.searchControl.setValue(species.upovCode);
    this.showAutocomplete = false;
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

  /**
   * 🔹 NEW: Check if we should show the results header
   * Returns TRUE only if:
   * - showResults is TRUE
   * - totalResults > 0 OR (totalResults === 0 AND filters are applied AND search type is species)
   */
  shouldShowResultsHeader(): boolean {
    if (!this.showResults) return false;
    
    const hasFiltersApplied = this.getActiveFilterCount() > 0;
    const isSpeciesSearch = this.searchTypeControl.value === 'species';
    
    // Show header if we have results
    if (this.totalResults > 0) return true;
    
    // Show header if filters applied and species search (even with 0 results)
    if (hasFiltersApplied && isSpeciesSearch) return false;
    
    // Hide header for simple zero-result searches
    return false;
  }

  /**
   * 🔹 NEW: Check if we should show the filters button
   * Returns TRUE only if:
   * - showResults is TRUE
   * - totalResults > 0 OR (totalResults === 0 AND filters are applied AND search type is species)
   */
   shouldShowFiltersButton(): boolean {
    if (!this.showResults) return false;
    
    const isSpeciesSearch = this.searchTypeControl.value === 'species';
    
    // NEVER show filters button for authorities search
    if (!isSpeciesSearch) return false;
    
    const hasFiltersApplied = this.getActiveFilterCount() > 0;
    
    // Show filters button if we have results (species only)
    if (this.totalResults > 0) return true;
    
    // Show filters button if filters applied (even with 0 results, species only)
    if (hasFiltersApplied) return true;
    
    // Hide filters button for simple zero-result searches
    return false;
  }

  /**
   * 🔹 NEW: Check if we should show the empty state
   * Returns TRUE only if:
   * - showResults is TRUE
   * - totalResults === 0
   */
  shouldShowEmptyState(): boolean {
    return this.showResults && this.totalResults === 0;
  }

  /**
   * 🔹 NEW: Check if we should show pagination
   * Returns TRUE only if:
   * - showResults is TRUE
   * - totalResults > 0
   * - getTotalPages() > 1
   */
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

  getAuthorityContact(item: SpeciesDto): string {
    const authorityItem = item as any;
    return authorityItem.contactPerson || '-';
  }

  getAuthorityEmail(item: SpeciesDto): string {
    const authorityItem = item as any;
    return authorityItem.email || '-';
  }

  getAuthorityPhone(item: SpeciesDto): string {
    const authorityItem = item as any;
    return authorityItem.phone || '-';
  }

  getAuthorityOrganization(item: SpeciesDto): string {
    const authorityItem = item as any;
    return authorityItem.organization || '-';
  }
}