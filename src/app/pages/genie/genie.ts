import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { debounceTime, distinctUntilChanged, map, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Footer } from "../../shared/footer/footer";
import { Header } from "../../shared/header/header";

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
    Footer,
    Header
  ],
  templateUrl: './genie.html',
  styleUrl: './genie.scss',
})
export class Genie implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';
  
  searchControl = new FormControl('');
  searchTypeControl = new FormControl('species');
  searchResults: SpeciesDto[] = [];
  showAutocomplete = false;
  latestSpecies: SpeciesDto[] = [];
  isSearching = false;

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

  selectSpecies(species: SpeciesDto) {
    // Navigate to appropriate results page with species data
    if (species.type === 'species') {
      this.router.navigate(['/genie/species'], {
        state: { selectedSpecies: species }
      });
    }
  }

  onSearchSubmit() {
    const query = this.searchControl.value?.trim();
    if (query && query.length >= 2) {
      this.showAutocomplete = false;
      
      const searchType = this.searchTypeControl.value;
      if (searchType === 'species') {
        this.router.navigate(['/genie/species'], {
          queryParams: { q: query },
          state: { results: this.searchResults }
        });
      } else {
        this.router.navigate(['/genie/authorities'], {
          queryParams: { q: query },
          state: { results: this.searchResults }
        });
      }
    }
  }

  hideAutocomplete() {
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 200);
  }
}