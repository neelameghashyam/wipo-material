import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Footer } from "../../shared/footer/footer";
import { Header } from "../../shared/header/header";
import { SpeciesDetailsDto, AuthorityCardData } from './specie-details.types';

@Component({
  selector: 'app-specie-details',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FormsModule,
    Footer,
    Header
  ],
  templateUrl: './specie-details.html',
  styleUrl: './specie-details.scss',
})
export class SpecieDetails implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';

  // Species data
  speciesDetails: SpeciesDetailsDto | null = null;
  isLoading = true;
  
  // Display data
  specie: any = {};
  specie1: any = {};

  // Authority cards
  allCards: AuthorityCardData[] = [];
  filteredCards: AuthorityCardData[] = [];
  
  showDetailedView = false;
  activeTab: 'protection' | 'dus' = 'protection';

  // Search and filter
  authorities: string[] = [];
  searchTerm = '';
  selectedValue = '';
  selectedCountryCode: string | null = null;
  filteredAuthorities: string[] = [];
  isOpen = false;
  isHigherRank = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  showPageDropdown = false;

  // Counts
  protectionCount = 0;
  dusCount = 0;

  ngOnInit(): void {
    // Get genieId from route params
    this.route.params.subscribe(params => {
      const genieId = params['id'];
      if (genieId) {
        this.loadSpeciesDetails(genieId);
      } else {
        this.snackBar.open('Invalid species ID', 'Close', { duration: 3000 });
        this.router.navigate(['/genie']);
      }
    });
  }

  loadSpeciesDetails(genieId: string): void {
    this.isLoading = true;
    
    console.log('Loading species details for genieId:', genieId);
    
    this.http.get<SpeciesDetailsDto>(`${this.API_BASE_URL}/species/${genieId}`)
      .pipe(
        catchError(error => {
          console.error('Error loading species details:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          this.snackBar.open('Error loading species details', 'Close', { duration: 3000 });
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        console.log('API Response received:', response);
        console.log('Response type:', typeof response);
        console.log('Protection array:', response?.protection);
        console.log('DUS Guidance:', response?.dusGuidance);
        
        if (response) {
          this.speciesDetails = response;
          this.processSpeciesData(response);
          this.buildAuthorityCards();
          this.buildAuthoritySearchList();
        } else {
          console.error('No response data received');
        }
        this.isLoading = false;
      });
  }

  processSpeciesData(data: SpeciesDetailsDto): void {
    // Basic info for compact view
    this.specie = {
      upovCode: data.upovCode,
      botanicalName: data.botanicalName,
      cropType: data.cropType,
      family: data.family
    };

    // Detailed info for expanded view
    this.specie1 = {
      otherBotanicalNames: data.otherBotanicalNames || '-',
      commonNames: this.parseCommonNames(data.names?.commonNames),
      varietyDenominationClass: data.denominationClass || '-',
      technicalWorkingParties: data.twp || '-',
      relatedLinks: this.buildRelatedLinks(data)
    };

    // Update counts - FIXED to use practicalExperience for both
    const practicalExp = data.dusGuidance?.practicalExperience || [];
    this.protectionCount = practicalExp.length; // All authorities
    this.dusCount = practicalExp.filter(auth => !auth.derived).length; // Non-derived only
    
    console.log('Protection count:', this.protectionCount);
    console.log('DUS count:', this.dusCount);
    console.log('Protection data:', data.protection);
    console.log('DUS data:', data.dusGuidance?.practicalExperience);
  }

  parseCommonNames(commonNames: any): string[] {
    if (!commonNames) return [];
    
    const names: string[] = [];
    if (commonNames.en) names.push(commonNames.en);
    if (commonNames.other) {
      const otherNames = commonNames.other.split(';').map((n: string) => n.trim());
      names.push(...otherNames);
    }
    
    return names.filter(n => n && n !== '-');
  }

  buildRelatedLinks(data: SpeciesDetailsDto): any[] {
    const links: any[] = [];
    
    if (data.dusGuidance?.testGuideline) {
      links.push({
        label: `Test Guidelines: ${data.dusGuidance.testGuideline}`,
        url: '#'
      });
    }
    
    return links;
  }

  buildAuthorityCards(): void {
    console.log('=== buildAuthorityCards called ===');
    console.log('speciesDetails exists:', !!this.speciesDetails);
    console.log('activeTab:', this.activeTab);
    
    if (!this.speciesDetails) {
      console.error('No species details available!');
      return;
    }

    // FIXED: Use practicalExperience for BOTH tabs
    // Protection tab shows ALL practicalExperience
    // DUS tab shows only non-derived practicalExperience
    const practicalExperience = this.speciesDetails.dusGuidance?.practicalExperience || [];

    console.log('practicalExperience count:', practicalExperience.length);
    console.log('practicalExperience:', practicalExperience);

    // Filter based on tab
    const filteredAuthorities = this.activeTab === 'dus'
      ? practicalExperience.filter((auth: any) => !auth.derived)
      : practicalExperience; // Protection tab shows ALL

    console.log('After tab filter:', filteredAuthorities.length);
    console.log('filteredAuthorities:', filteredAuthorities);

    if (!filteredAuthorities || filteredAuthorities.length === 0) {
      console.warn('No authorities to display after filtering!');
      this.allCards = [];
      this.filteredCards = [];
      return;
    }

    this.allCards = filteredAuthorities.map((auth: any) => {
      const isoCode = auth.authorityCode;
      
      return {
        country: auth.authorityName,
        code: isoCode,
        tag: this.activeTab === 'protection' ? 'Protection' : 'DUS Experience',
        flag: this.getFlagUrl(isoCode),
        protectionType: this.activeTab === 'protection' ? 'Protection' : undefined,
        notes: auth.noteSequence || '',
        administrativeWebsite: auth.administrativeWebsite,
        lawWebsite: auth.lawWebsite,
        contacts: [{
          name: '-',
          email: '-',
          phone: '-',
          office: auth.authorityName
        }]
      };
    });

    console.log('allCards created:', this.allCards.length);
    console.log('allCards sample:', this.allCards[0]);

    this.filteredCards = [...this.allCards];
    this.currentPage = 1;
    
    console.log('filteredCards set:', this.filteredCards.length);
    console.log('=== buildAuthorityCards complete ===');
  }

  buildAuthoritySearchList(): void {
    if (!this.speciesDetails) return;

    // FIXED: Always use practicalExperience for search
    const practicalExp = this.speciesDetails.dusGuidance?.practicalExperience || [];

    // Filter based on active tab
    const filteredAuthorities = this.activeTab === 'dus'
      ? practicalExp.filter((auth: any) => !auth.derived)
      : practicalExp;

    const uniqueAuthorities = new Set<string>();
    
    filteredAuthorities.forEach((auth: any) => {
      const displayName = `${auth.authorityName} (${auth.authorityCode})`;
      uniqueAuthorities.add(displayName);
    });

    this.authorities = Array.from(uniqueAuthorities).sort();
  }

  getFlagUrl(isoCode: string): string {
    if (!isoCode || isoCode === '-' || isoCode.length !== 2) {
      return '';
    }
    // Handle special cases
    if (isoCode === 'QZ') return ''; // EU doesn't have a standard flag in this format
    
    return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
  }

  setTab(tabId: 'protection' | 'dus'): void {
    this.activeTab = tabId;
    this.clearSearch();
    this.buildAuthorityCards();
    this.buildAuthoritySearchList();
  }

  toggleMoreDetails(): void {
    this.showDetailedView = !this.showDetailedView;
  }

  onSearch(term: string): void {
    this.searchTerm = term;

    if (!term) {
      this.filteredAuthorities = [];
      return;
    }

    const lower = term.toLowerCase();
    this.filteredAuthorities = this.authorities.filter(a =>
      a.toLowerCase().includes(lower)
    );
  }

  selectOption(option: string): void {
    this.selectedValue = option;
    this.searchTerm = option;
    this.isOpen = false;
    this.filteredAuthorities = [];

    const match = option.match(/\((.*?)\)/);
    this.selectedCountryCode = match ? match[1] : null;

    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedValue = '';
    this.selectedCountryCode = null;
    this.filteredAuthorities = [];
    this.isOpen = false;
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.filteredAuthorities = [];
  }

  applyFilters(): void {
    let filtered = [...this.allCards];

    if (this.selectedCountryCode) {
      filtered = filtered.filter(card =>
        card.code === this.selectedCountryCode
      );
    }

    if (this.isHigherRank) {
      // Apply higher rank filter if needed
      // This would filter based on some criteria from the API
      filtered = filtered.filter(card =>
        ['AT', 'BE', 'FR', 'DE', 'NL'].includes(card.code)
      );
    }

    this.filteredCards = filtered;
  }

  onHigherRankToggle(event: any): void {
    this.isHigherRank = event.checked;
    this.currentPage = 1;
    this.applyFilters();
  }

  navigateBack(): void {
    this.router.navigate(['/genie']);
  }

  // Pagination methods
  getPaginatedCards(): AuthorityCardData[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCards.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredCards.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  togglePageDropdown(): void {
    this.showPageDropdown = !this.showPageDropdown;
  }

  goToPageFromDropdown(page: number): void {
    this.changePage(page);
    this.showPageDropdown = false;
  }

  getAllPages(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  shouldShowPagination(): boolean {
    return this.filteredCards.length > 0 && this.getTotalPages() > 1;
  }

  openWebsite(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}