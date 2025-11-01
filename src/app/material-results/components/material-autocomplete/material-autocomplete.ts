import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, switchMap } from 'rxjs/operators';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Country, Species } from '../../../core/models/variety.model';

@Component({
  selector: 'app-material-autocomplete',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './material-autocomplete.html',
  styleUrl: './material-autocomplete.scss'
})
export class MaterialAutocompleteComponent implements OnInit {
  countryControl = new FormControl('');
  speciesControl = new FormControl('');
 
  selectedCountries: Country[] = [];
  allCountries: Country[] = [];
  filteredCountries$!: Observable<Country[]>;
 
  filteredSpecies$!: Observable<Species[]>;
  isLoadingSpecies = false;
  selectedSpecies: Species | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.allCountries = this.mockDataService.getCountries();
   
    this.filteredCountries$ = this.countryControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : '';
        return this.filterCountries(filterValue);
      })
    );

    this.filteredSpecies$ = this.speciesControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        const searchTerm = typeof value === 'string' ? value : '';
        if (!searchTerm || searchTerm.length < 2) {
          this.isLoadingSpecies = false;
          return of([]);
        }
        this.isLoadingSpecies = true;
        return this.mockDataService.searchSpecies(searchTerm);
      }),
      map(results => {
        this.isLoadingSpecies = false;
        return results;
      })
    );
  }

  private filterCountries(value: string): Country[] {
    const filterValue = value.toLowerCase();
    return this.allCountries.filter(country =>
      !this.selectedCountries.find(sc => sc.code === country.code) &&
      (country.name.toLowerCase().includes(filterValue) ||
       country.code.toLowerCase().includes(filterValue))
    );
  }

  selectCountry(event: any): void {
    const country = event.option.value as Country;
    this.selectedCountries.push(country);
    this.countryControl.setValue('');
    console.log('✅ Country selected:', country);
  }

  removeCountry(country: Country): void {
    const index = this.selectedCountries.indexOf(country);
    if (index >= 0) {
      this.selectedCountries.splice(index, 1);
      console.log('❌ Country removed:', country);
    }
  }

  onSpeciesSelected(event: any): void {
    this.selectedSpecies = event.option.value as Species;
    console.log('✅ Species selected:', this.selectedSpecies);
  }

  clearSpecies(): void {
    this.speciesControl.setValue('');
    this.selectedSpecies = null;
    this.isLoadingSpecies = false;
    console.log('❌ Species cleared');
  }

  displaySpecies(species: Species): string {
    return species ? `${species.latinName} (${species.upovCode})` : '';
  }

  getSelectedCountriesText(): string {
    return this.selectedCountries.length > 0
      ? this.selectedCountries.map(c => `${c.code} - ${c.name}`).join(', ')
      : 'None';
  }

  getSelectedSpeciesText(): string {
    return this.selectedSpecies
      ? `${this.selectedSpecies.latinName} (${this.selectedSpecies.upovCode})`
      : 'None';
  }
}