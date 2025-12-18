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
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearchResultDto, AuthorityDto } from '../genie.types';

@Component({
  selector: 'app-genie-authority-results',
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
    MatSnackBarModule
  ],
  templateUrl: './genie-authority-results.html',
  styleUrl: './genie-authority-results.scss',
})
export class GenieAuthorityResults implements OnInit {
  @Input() searchQuery: string = '';
  @Input() initialResults: AuthorityDto[] = [];
  @Output() backToHome = new EventEmitter<void>();
  
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';
  
  searchControl = new FormControl('');
  searchResults: AuthorityDto[] = [];
  selectedAuthority: AuthorityDto | null = null;
  showPageDropdown = false;
  
  totalResults = 0;
  currentPage = 1;
  itemsPerPage = 15;

  ngOnInit() {
    this.searchControl.setValue(this.searchQuery);
    
    if (this.initialResults && this.initialResults.length > 0) {
      this.searchResults = this.initialResults;
      this.totalResults = this.initialResults.length;
    } else {
      this.performSearch(this.searchQuery);
    }
  }

  performSearch(query: string): void {
    const searchQuery = query.trim();
    
    this.http.get<any[]>(`${this.API_BASE_URL}/authority/search?q=${encodeURIComponent(searchQuery)}`)
      .pipe(
        catchError(error => {
          console.error('Error searching authorities:', error);
          this.snackBar.open('Error searching authorities', 'Close', { duration: 3000 });
          return of([]);
        })
      )
      .subscribe(response => {
        this.searchResults = (response || []).map((item: any) => ({
          genieId: item.authorityId.toString(),
          upovCode: item.isoCode || '-',
          botanicalName: item.name,
          type: 'authority',
          imageUrl: this.getFlagUrl(item.isoCode),
          authorityId: item.authorityId,
          name: item.name,
          isoCode: item.isoCode,
          administrativeWebsite: item.administrativeWebsite,
          lawWebsite: item.lawWebsite
        }));
        
        this.totalResults = this.searchResults.length;
      });
  }

  getFlagUrl(isoCode: string | undefined): string {
    if (!isoCode || isoCode === '-' || isoCode.length !== 2) {
      return '';
    }
    return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
  }

  selectAuthority(authority: AuthorityDto) {
    this.loadAuthorityDetails(authority.authorityId!);
  }

  loadAuthorityDetails(authorityId: number) {
    this.http.get<any>(`${this.API_BASE_URL}/authority/${authorityId}`)
      .pipe(
        catchError(error => {
          console.error('Error loading authority details:', error);
          this.snackBar.open('Error loading authority details', 'Close', { duration: 3000 });
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.selectedAuthority = {
            genieId: response.authorityId.toString(),
            upovCode: response.isoCode || '-',
            botanicalName: response.name,
            type: 'authority',
            imageUrl: this.getFlagUrl(response.isoCode),
            authorityId: response.authorityId,
            name: response.name,
            isoCode: response.isoCode,
            administrativeWebsite: response.administrativeWebsite,
            lawWebsite: response.lawWebsite,
            fullDetails: response
          };
          this.searchControl.setValue(response.name);
        }
      });
  }

  clearSearch() {
    this.backToHome.emit();
  }

  shouldShowEmptyState(): boolean {
    return this.totalResults === 0;
  }

  shouldShowPagination(): boolean {
    return this.totalResults > 0 && this.getTotalPages() > 1;
  }

  getPaginatedResults(): AuthorityDto[] {
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

  getAuthorityWebsite(item: AuthorityDto): string {
    return item.administrativeWebsite || '-';
  }

  getAuthorityLawWebsite(item: AuthorityDto): string {
    return item.lawWebsite || '-';
  }

  getAuthorityName(item: AuthorityDto): string {
    return item.name || '-';
  }

  getAuthorityIsoCode(item: AuthorityDto): string {
    return item.isoCode || '-';
  }
}