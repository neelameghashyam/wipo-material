import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearchResultDto, SpeciesDto, FilterOptions, ActiveFilters } from '../genie.types';

@Component({
  selector: 'app-genie-species-results',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatSelectModule
  ],
  templateUrl: './genie-species-results.html',
  styleUrl: './genie-species-results.scss',
})
export class GenieSpeciesResults implements OnInit {
  @Input() searchQuery: string = '';
  @Input() initialResults: SpeciesDto[] = [];
  @Output() backToHome = new EventEmitter<void>();
  
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';
  
  searchControl = new FormControl('');
  searchResults: SpeciesDto[] = [];
  selectedSpecies: SpeciesDto | null = null;
  showFilters = false;
  showPageDropdown = false;
  
  totalResults = 0;
  currentPage = 1;
  itemsPerPage = 15;

  filterOptions: FilterOptions = {
    families: [],
    genera: [],
    regions: []
  };

  activeFilters: ActiveFilters = {
    families: [],
    genera: [],
    regions: [],
    cropTypes: []
  };

  filterSearchControl = new FormControl('');
  filteredFamilies: string[] = [];
  filteredGenera: string[] = [];
  filteredRegions: string[] = [];

  ngOnInit() {
    this.searchControl.setValue(this.searchQuery);
    
    if (this.initialResults && this.initialResults.length > 0) {
      this.searchResults = this.initialResults;
      this.totalResults = this.initialResults.length;
    } else {
      this.performSearch(this.searchQuery);
    }

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
      });
  }

  performSearch(query: string): void {
    const searchQuery = query.trim();
    
    this.http.get<any[]>(`${this.API_BASE_URL}/species/search?q=${encodeURIComponent(searchQuery)}`)
      .pipe(
        catchError(error => {
          console.error('Error searching species:', error);
          this.snackBar.open('Error searching species', 'Close', { duration: 3000 });
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
        
        this.filterOptions.families = [];
        this.filterOptions.genera = [];
        this.filteredFamilies = [];
        this.filteredGenera = [];
      });
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

    return filtered;
  }

  applyFiltersToResults() {
    const query = this.searchControl.value;
    if (query && query.trim().length >= 2) {
      this.performSearch(query);
      this.currentPage = 1;
    }
  }

  resetFilters() {
    this.activeFilters = {
      families: [],
      genera: [],
      regions: [],
      cropTypes: []
    };
    this.applyFiltersToResults();
  }

  getActiveFilterCount(): number {
    return this.activeFilters.families.length + 
           this.activeFilters.genera.length + 
           this.activeFilters.regions.length +
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
    this.loadSpeciesDetails(species.genieId);
  }

  loadSpeciesDetails(genieId: string) {
    this.http.get<any>(`${this.API_BASE_URL}/species/${genieId}`)
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
        }
      });
  }

  clearSearch() {
    this.backToHome.emit();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  shouldShowResultsHeader(): boolean {
    const hasFiltersApplied = this.getActiveFilterCount() > 0;
    
    if (this.totalResults > 0) return true;
    if (hasFiltersApplied) return false;
    
    return false;
  }

  shouldShowFiltersButton(): boolean {
    const hasFiltersApplied = this.getActiveFilterCount() > 0;
    
    if (this.totalResults > 0) return true;
    if (hasFiltersApplied) return true;
    
    return false;
  }

  shouldShowEmptyState(): boolean {
    return this.totalResults === 0;
  }

  shouldShowPagination(): boolean {
    return this.totalResults > 0 && this.getTotalPages() > 1;
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
}