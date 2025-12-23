import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearchResultDto, SpeciesDto, FilterOptions, ActiveFilters } from '../genie.types';

@Component({
  selector: 'app-genie-species-results',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
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
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './genie-species-results.html',
  styleUrl: './genie-species-results.scss',
})
export class GenieSpeciesResults implements OnInit, OnChanges {
  @Input() searchQuery: string = '';
  @Output() backToHome = new EventEmitter<void>();
  
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';
  
  searchControl = new FormControl('');
  searchResults: SpeciesDto[] = [];
  allSearchResults: SpeciesDto[] = [];
  selectedSpecies: SpeciesDto | null = null;
  showFilters = false;
  showPageDropdown = false;
  isLoading = false;
  
  totalResults = 0;
  currentPage = 1;
  itemsPerPage = 15;

  filterOptions: FilterOptions = {
    authorities: [],
    families: [],
    cropTypes: []
  };

  activeFilters: ActiveFilters = {
    authorities: [],
    families: [],
    cropTypes: []
  };

  filterSearchControl = new FormControl('');

  ngOnInit() {
    this.searchControl.setValue(this.searchQuery);
    this.performSearch(this.searchQuery);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchQuery'] && !changes['searchQuery'].firstChange) {
      const newQuery = changes['searchQuery'].currentValue;
      if (newQuery && newQuery !== this.searchQuery) {
        this.searchControl.setValue(newQuery);
        this.resetFilters();
        this.currentPage = 1;
        this.performSearch(newQuery);
      }
    }
  }

  generateFiltersFromResults(results: SpeciesDto[]) {
    const authoritiesMap = new Map<string, { value: string; label: string }>();
    results.forEach(item => {
      const isoCodes = item.fullDetails?.authorityIsoCodes || [];
      const names = item.fullDetails?.authorityNames || [];
      
      isoCodes.forEach((code: string, index: number) => {
        if (code && !authoritiesMap.has(code)) {
          authoritiesMap.set(code, {
            value: code,
            label: names[index] || code
          });
        }
      });
    });

    const familiesSet = new Set<string>();
    results.forEach(item => {
      if (item.family) {
        familiesSet.add(item.family);
      }
    });

    const cropTypesSet = new Set<string>();
    results.forEach(item => {
      const cropType = item.fullDetails?.cropType;
      if (cropType) {
        cropTypesSet.add(cropType);
      }
    });

    this.filterOptions = {
      authorities: Array.from(authoritiesMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
      families: Array.from(familiesSet).map(f => ({ value: f, label: f })).sort((a, b) => a.label.localeCompare(b.label)),
      cropTypes: Array.from(cropTypesSet).map(c => ({ value: c, label: c })).sort((a, b) => a.label.localeCompare(b.label))
    };
  }

  performSearch(query: string): void {
    const searchQuery = query.trim();
    
    if (!searchQuery || searchQuery.length < 3) {
      this.searchResults = [];
      this.allSearchResults = [];
      this.totalResults = 0;
      this.filterOptions = { authorities: [], families: [], cropTypes: [] };
      return;
    }

    this.isLoading = true;
    
    this.http.get<any[]>(`${this.API_BASE_URL}/species/search?q=${encodeURIComponent(searchQuery)}`)
      .pipe(
        catchError(error => {
          console.error('Error searching species:', error);
          this.snackBar.open('Error searching species', 'Close', { duration: 3000 });
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(response => {
        let results: SpeciesDto[] = (response || []).map((item: any) => ({
          genieId: item.genieId.toString(),
          upovCode: item.upovCode,
          botanicalName: item.botanicalName || item.defaultName,
          commonName: '',
          family: item.family || '',
          genus: '',
          region: '',
          type: 'species',
          updated: this.isRecentlyUpdated(item.updatedDate),
          imageUrl: '',
          updatedDate: item.updatedDate,
          createdDate: item.createdDate,
          fullDetails: item
        }));
        
        this.allSearchResults = results;
        this.generateFiltersFromResults(results);
        this.applyFiltersToResults();
        this.isLoading = false;
      });
  }

  isRecentlyUpdated(updatedDate: string | undefined): boolean {
    if (!updatedDate) {
      return false;
    }

    try {
      const updated = new Date(updatedDate);
      const now = new Date();
      const currentYear = now.getFullYear();
      const updatedYear = updated.getFullYear();

      const daysDiff = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
      
      return updatedYear === currentYear || daysDiff <= 90;
    } catch (error) {
      console.error('Error parsing date:', error);
      return false;
    }
  }

  applyFiltersToResults() {
    let filtered = [...this.allSearchResults];

    if (this.activeFilters.authorities.length > 0) {
      filtered = filtered.filter(item => {
        const authorities = item.fullDetails?.authorityIsoCodes || [];
        return this.activeFilters.authorities.some(auth => authorities.includes(auth));
      });
    }

    if (this.activeFilters.families.length > 0) {
      filtered = filtered.filter(item => 
        this.activeFilters.families.includes(item.family || '')
      );
    }

    if (this.activeFilters.cropTypes.length > 0) {
      filtered = filtered.filter(item => {
        const cropType = item.fullDetails?.cropType || '';
        return this.activeFilters.cropTypes.includes(cropType);
      });
    }

    this.searchResults = filtered;
    this.totalResults = filtered.length;
    this.currentPage = 1;
  }

  resetFilters() {
    this.activeFilters = {
      authorities: [],
      families: [],
      cropTypes: []
    };
    this.applyFiltersToResults();
  }

  clearAllFilters() {
    this.resetFilters();
  }

  getActiveFilterCount(): number {
    return this.activeFilters.authorities.length + 
           this.activeFilters.families.length + 
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

  getFilterLabel(filterType: keyof ActiveFilters, value: string): string {
    const option = this.filterOptions[filterType].find(opt => opt.value === value);
    return option ? option.label : value;
  }

  selectSpecies(species: SpeciesDto) {
    // Navigate to species details page
    this.router.navigate(['/species', species.genieId]);
  }

  clearSearch() {
    this.backToHome.emit();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  shouldShowResultsHeader(): boolean {
    return this.totalResults > 0 || this.getActiveFilterCount() > 0;
  }

  shouldShowFiltersButton(): boolean {
    return this.totalResults > 0 || this.getActiveFilterCount() > 0;
  }

  shouldShowEmptyState(): boolean {
    return !this.isLoading && this.totalResults === 0;
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