import { Component, OnInit, inject } from '@angular/core';
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
import { debounceTime, distinctUntilChanged, map, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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
export class Genie implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  
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
        });
    } else {
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
        });
    }
  }

  getFlagUrl(isoCode: string | undefined): string {
    if (!isoCode || isoCode === '-' || isoCode.length !== 2) {
      return '';
    }
    return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
  }

  selectSpecies(species: SearchResultDto) {
    // Show results component with selected species
    this.showResults = true;
    this.searchQuery = species.upovCode;
    this.currentSearchType = species.type === 'species' ? 'species' : 'authorities';
    this.searchControl.setValue(this.searchQuery);
    this.showAutocomplete = false;
  }

  onSearchSubmit() {
    const query = this.searchControl.value?.trim();
    if (query && query.length >= 2) {
      this.showAutocomplete = false;
      this.showResults = true;
      this.searchQuery = query;
      this.currentSearchType = this.searchTypeControl.value === 'species' ? 'species' : 'authorities';
      
      // Update URL without navigation
      window.history.pushState(
        {}, 
        '', 
        `/genie?q=${encodeURIComponent(query)}&type=${this.currentSearchType}`
      );
    }
  }

  onBackToHome() {
    this.showResults = false;
    this.searchControl.setValue('');
    this.searchQuery = '';
    this.searchResults = [];
    
    // Update URL
    window.history.pushState({}, '', '/genie');
  }

  hideAutocomplete() {
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 200);
  }
}