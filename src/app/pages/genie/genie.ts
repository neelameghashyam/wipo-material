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
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

interface SpeciesDto {
  genieId: string;
  upovCode: string;
  botanicalName?: string;
  commonName?: string;
  type: 'species' | 'authority';
}

interface HealthResponse {
  status: string;
  speciesCount: number;
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
    MatMenuModule
  ],
  templateUrl: './genie.html',
  styleUrl: './genie.scss',
})
export class Genie implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  
  private readonly API_BASE = 'http://localhost:8000/api';
  
  // Hardcoded data
  private allData: SpeciesDto[] = [
    { genieId: 'SP001', upovCode: 'MALUS', botanicalName: 'Malus Mill.', commonName: 'Apple', type: 'species' },
    { genieId: 'SP002', upovCode: 'ANACO', botanicalName: 'Ananas Mill.', commonName: 'Pineapple', type: 'species' },
    { genieId: 'SP003', upovCode: 'DIOSM', botanicalName: 'Dioscorea Plum.', commonName: 'Yam', type: 'species' },
    { genieId: 'SP004', upovCode: 'SOLTU', botanicalName: 'Solanum tuberosum L.', commonName: 'Potato', type: 'species' },
    { genieId: 'SP005', upovCode: 'TRITX', botanicalName: 'Triticum L.', commonName: 'Wheat', type: 'species' },
    { genieId: 'SP006', upovCode: 'ORYSA', botanicalName: 'Oryza sativa L.', commonName: 'Rice', type: 'species' },
    { genieId: 'SP007', upovCode: 'ZEAMA', botanicalName: 'Zea mays L.', commonName: 'Maize', type: 'species' },
    { genieId: 'SP008', upovCode: 'LACTU', botanicalName: 'Lactuca sativa L.', commonName: 'Lettuce', type: 'species' },
    { genieId: 'SP009', upovCode: 'SOLLY', botanicalName: 'Solanum lycopersicum L.', commonName: 'Tomato', type: 'species' },
    { genieId: 'SP010', upovCode: 'BRSOL', botanicalName: 'Brassica oleracea L.', commonName: 'Cabbage', type: 'species' },
    { genieId: 'AU001', upovCode: 'CPVO', botanicalName: 'Community Plant Variety Office', commonName: 'European Union', type: 'authority' },
    { genieId: 'AU002', upovCode: 'USPP', botanicalName: 'United States Patent Office', commonName: 'United States', type: 'authority' },
    { genieId: 'AU003', upovCode: 'CIOPORA', botanicalName: 'Int. Association of Breeders', commonName: 'International', type: 'authority' },
    { genieId: 'AU004', upovCode: 'ABELM', botanicalName: 'Agriculture Belgium', commonName: 'Belgium', type: 'authority' },
    { genieId: 'AU005', upovCode: 'INASE', botanicalName: 'National Seed Institute', commonName: 'Argentina', type: 'authority' }
  ];
  
  searchControl = new FormControl('');
  searchTypeControl = new FormControl('species');
  searchResults: SpeciesDto[] = [];
  selectedSpecies: SpeciesDto | null = null;
  showAutocomplete = false;
  
  isSearching = false;
  isLoadingDetails = false;

  ngOnInit() {
    this.setupSearchListener();
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
          
          // Filter based on search type
          const searchType = this.searchTypeControl.value;
          const searchQuery = query.trim().toLowerCase();
          
          const filtered = this.allData.filter(item => {
            // Filter by type first
            if (searchType === 'species' && item.type !== 'species') return false;
            if (searchType === 'authorities' && item.type !== 'authority') return false;
            
            // Then filter by query
            return (
              item.upovCode.toLowerCase().includes(searchQuery) ||
              item.botanicalName?.toLowerCase().includes(searchQuery) ||
              item.commonName?.toLowerCase().includes(searchQuery) ||
              item.genieId.toLowerCase().includes(searchQuery)
            );
          });
          
          setTimeout(() => this.isSearching = false, 200);
          return filtered;
        })
      )
      .subscribe(results => {
        this.searchResults = results;
      });

    // Re-trigger search when type changes
    this.searchTypeControl.valueChanges.subscribe(() => {
      const currentValue = this.searchControl.value;
      if (currentValue && currentValue.length >= 2) {
        this.searchControl.setValue(currentValue); // Trigger search
      }
    });
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
      const searchType = this.searchTypeControl.value;
      console.log('Search submitted:', query, 'Type:', searchType);
      
      // If there are results, select the first one
      if (this.searchResults.length > 0) {
        this.selectSpecies(this.searchResults[0]);
      }
    }
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.searchResults = [];
    this.selectedSpecies = null;
    this.showAutocomplete = false;
  }

  hideAutocomplete() {
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 200);
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}