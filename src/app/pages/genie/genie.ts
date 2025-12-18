import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { debounceTime, distinctUntilChanged, map, startWith, catchError, switchMap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { Footer } from "../../shared/footer/footer";
import { Header } from "../../shared/header/header";
import { GenieSpeciesResults } from './genie-species-results/genie-species-results';
import { GenieAuthorityResults } from './genie-authority-results/genie-authority-results';
import { SearchResultDto } from './genie.types';

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
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    Footer,
    Header,
    GenieSpeciesResults,
    GenieAuthorityResults
  ],
  templateUrl: './genie.html',
  styleUrl: './genie.scss',
})
export class Genie implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';
  
  searchControl = new FormControl('');
  searchTypeControl = new FormControl('species');
  searchResults: SearchResultDto[] = [];
  showAutocomplete = false;
  latestSpecies: SearchResultDto[] = [];
  isSearching = false;
  
  // State management for showing results
  showResults = false;
  searchQuery = '';
  currentSearchType: 'species' | 'authorities' = 'species';

  ngOnInit() {
    this.setupSearchListener();
    this.loadLatestSpecies();
    this.checkUrlParams();
    
    window.addEventListener('popstate', this.handlePopState);
  }

  ngOnDestroy() {
    window.removeEventListener('popstate', this.handlePopState);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handlePopState = () => {
    this.checkUrlParams();
  }

  private checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const type = urlParams.get('type');
    
    if (query) {
      this.searchControl.setValue(query, { emitEvent: false });
      this.searchQuery = query;
      this.showResults = true;
      this.showAutocomplete = false;
      
      if (type === 'authorities') {
        this.searchTypeControl.setValue('authorities', { emitEvent: false });
        this.currentSearchType = 'authorities';
      } else {
        this.searchTypeControl.setValue('species', { emitEvent: false });
        this.currentSearchType = 'species';
      }
      
      // Don't perform search here - let the results component handle it
    } else {
      this.resetToHome();
    }
  }

  private resetToHome() {
    this.showResults = false;
    this.searchControl.setValue('', { emitEvent: false });
    this.searchQuery = '';
    this.searchResults = [];
    this.showAutocomplete = false;
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
    // Autocomplete listener - only for showing suggestions
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          // Only show autocomplete when not in results view
          if (!query || query.trim().length < 2 || this.showResults) {
            this.showAutocomplete = false;
            this.searchResults = [];
            return of([]);
          }
          
          this.isSearching = true;
          this.showAutocomplete = true;
          return this.performAutocompleteSearch(query);
        })
      )
      .subscribe();

    // Search type change listener
    this.searchTypeControl.valueChanges.subscribe(() => {
      const currentValue = this.searchControl.value;
      if (currentValue && currentValue.length >= 2 && !this.showResults) {
        // Trigger autocomplete refresh
        this.searchControl.setValue(currentValue);
      }
    });
  }

  performAutocompleteSearch(query: string) {
    const searchType = this.searchTypeControl.value;
    const searchQuery = query.trim();
    
    if (searchType === 'species') {
      return this.http.get<any[]>(`${this.API_BASE_URL}/species/search?q=${encodeURIComponent(searchQuery)}`)
        .pipe(
          map(response => {
            this.searchResults = (response || []).map((item: any) => ({
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
            this.isSearching = false;
            return this.searchResults;
          }),
          catchError(error => {
            console.error('Error searching species:', error);
            this.isSearching = false;
            this.searchResults = [];
            return of([]);
          })
        );
    } else {
      return this.http.get<any[]>(`${this.API_BASE_URL}/authority/search?q=${encodeURIComponent(searchQuery)}`)
        .pipe(
          map(response => {
            this.searchResults = (response || []).map((item: any) => ({
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
              authorityId: item.authorityId,
              name: item.name,
              isoCode: item.isoCode,
              administrativeWebsite: item.administrativeWebsite,
              lawWebsite: item.lawWebsite
            }));
            this.isSearching = false;
            return this.searchResults;
          }),
          catchError(error => {
            console.error('Error searching authorities:', error);
            this.isSearching = false;
            this.searchResults = [];
            return of([]);
          })
        );
    }
  }

  getFlagUrl(isoCode: string | undefined): string {
    if (!isoCode || isoCode === '-' || isoCode.length !== 2) {
      return '';
    }
    return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
  }

  selectSpecies(species: SearchResultDto) {
    this.showAutocomplete = false;
    this.showResults = true;
    this.searchQuery = species.upovCode;
    this.currentSearchType = species.type === 'species' ? 'species' : 'authorities';
    this.searchControl.setValue(this.searchQuery, { emitEvent: false });
    
    // Update URL
    window.history.pushState(
      {}, 
      '', 
      `/genie?q=${encodeURIComponent(this.searchQuery)}&type=${this.currentSearchType}`
    );
  }

  onSearchSubmit() {
    const query = this.searchControl.value?.trim();
    if (!query || query.length < 2) {
      return;
    }

    this.showAutocomplete = false;
    this.showResults = true;
    this.searchQuery = query;
    this.currentSearchType = this.searchTypeControl.value === 'species' ? 'species' : 'authorities';
    
    // Update URL
    window.history.pushState(
      {}, 
      '', 
      `/genie?q=${encodeURIComponent(query)}&type=${this.currentSearchType}`
    );
  }

  onBackToHome() {
    this.resetToHome();
    window.history.pushState({}, '', '/genie');
  }

  clearSearchInput() {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchResults = [];
    this.showAutocomplete = false;
    
    if (this.showResults) {
      this.onBackToHome();
    }
  }

  hideAutocomplete() {
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 200);
  }
}