import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs';
import { of } from 'rxjs';

import { Footer } from '../../shared/footer/footer';
import { Header } from '../../shared/header/header';

// Types
interface AuthorityDetailsDto {
  authorityId: number;
  authorityName: string;
  authorityCode: string;
  administrativeWebsite?: string;
  lawWebsite?: string;
  contactInfo?: {
    registrar?: string;
    department?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  protection?: {
    totalSpecies: number;
    coverageType: string;
  };
  taxaWithExperience?: TaxaDto[];
}

interface TaxaDto {
  genieId: number;
  upovCode: string;
  botanicalName: string;
  names: {
    defaultName: string;
    commonNames: {
      en?: string;
      de?: string;
      fr?: string;
      es?: string;
      other?: string;
    };
  };
  notes?: string;
  derived: boolean;
  family?: string;
  cropType?: string;
}

interface ProductDisplay {
  genieId: string;
  upovCode: string;
  botanicalName: string;
  commonName: string;
  family: string;
  imageUrl: string;
  updated: boolean;
  fullDetails: { cropType: string };
}

@Component({
  selector: 'app-authority-details',
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
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    Footer,
    Header
  ],
  templateUrl: './authority-details.html',
  styleUrls: ['./authority-details.scss']
})
export class AuthorityDetails implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  private readonly API_BASE_URL = 'http://localhost:8000/api/v1';

  // Authority data
  authorityDetails: AuthorityDetailsDto | null = null;
  authorityId: number | null = null;
  isLoading = true;

  // Display data
  country = {
    name: '',
    iso: '',
    flag: '',
    backText: 'Back to Search',
    buttonText: 'Contact Authority'
  };

  upov = {
    member: true,
    memberSince: '',
    protectionType: ''
  };

  contact = {
    title: 'Contact Information',
    registrar: '',
    department: '',
    phone: '',
    email: '',
    website: ''
  };

  /** 🔎 Auto-search */
  searchCtrl = new FormControl('');

  /** 📦 Data handling */
  allProducts: ProductDisplay[] = [];
  displayProducts: ProductDisplay[] = [];

  /** 📄 Pagination */
  currentPage = 1;
  itemsPerPage = 6;
  showPageDropdown = false;

  /** 🧭 Tabs */
  activeTab: string = 'protection';

  // ------------------------------------
  // INIT
  // ------------------------------------
  ngOnInit() {
    // Get authority ID from route params or query params
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.authorityId = parseInt(id, 10);
        this.loadAuthorityDetails(this.authorityId);
      }
    });

    // Also check query params for authorityId
    this.route.queryParams.subscribe(params => {
      const id = params['authorityId'];
      if (id && !this.authorityId) {
        this.authorityId = parseInt(id, 10);
        this.loadAuthorityDetails(this.authorityId);
      }
    });

    // Initialize search
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.filterProducts(value ?? '');
      });
  }

  // ------------------------------------
  // API INTEGRATION
  // ------------------------------------
  loadAuthorityDetails(authorityId: number): void {
    this.isLoading = true;

    // Load basic authority info first
    this.http.get<any>(`${this.API_BASE_URL}/authority/${authorityId}`)
      .pipe(
        catchError(error => {
          console.error('Error loading authority details:', error);
          this.snackBar.open('Error loading authority details', 'Close', { duration: 3000 });
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.processAuthorityBasicInfo(response);
          
          // Load DUS taxa data
          this.loadDusTaxaData(authorityId);
        } else {
          this.isLoading = false;
        }
      });
  }

  loadDusTaxaData(authorityId: number): void {
    this.http.get<AuthorityDetailsDto>(`${this.API_BASE_URL}/authority/${authorityId}/dus`)
      .pipe(
        catchError(error => {
          console.error('Error loading DUS taxa data:', error);
          // Don't show error - just use empty data
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.taxaWithExperience) {
          this.authorityDetails = response;
          this.processProductsFromTaxa(response.taxaWithExperience);
        }
        this.isLoading = false;
      });
  }

  processAuthorityBasicInfo(data: any): void {
    // Update country info
    this.country = {
      name: data.name || '',
      iso: data.isoCode || '',
      flag: this.getFlagUrl(data.isoCode),
      backText: 'Back to Search',
      buttonText: 'Contact Authority'
    };

    // Update contact info
    this.contact = {
      title: 'Contact Information',
      registrar: data.contactInfo?.registrar || 'Authority Contact',
      department: data.contactInfo?.department || data.name || '',
      phone: data.contactInfo?.phone || '-',
      email: data.contactInfo?.email || '-',
      website: data.administrativeWebsite || '-'
    };

    // Update UPOV info
    this.upov = {
      member: true,
      memberSince: data.memberSince || '',
      protectionType: data.protection?.coverageType || 'All genera and species'
    };
  }

  processProductsFromTaxa(taxa: TaxaDto[]): void {
    this.allProducts = taxa.map(item => ({
      genieId: item.genieId.toString(),
      upovCode: item.upovCode,
      botanicalName: item.botanicalName,
      commonName: this.extractCommonName(item.names?.commonNames),
      family: item.family || '',
      imageUrl: this.getPlaceholderImage(),
      updated: false,
      fullDetails: { 
        cropType: item.cropType || this.determineCropType(item.botanicalName) 
      }
    }));

    this.displayProducts = [...this.allProducts];
    this.currentPage = 1;
  }

  extractCommonName(commonNames: any): string {
    if (!commonNames) return '';
    
    // Priority: en > de > fr > es > other
    if (commonNames.en) {
      const enNames = commonNames.en.split(';');
      return enNames[enNames.length - 1].trim();
    }
    if (commonNames.de) return commonNames.de.split(';')[0].trim();
    if (commonNames.fr) return commonNames.fr.split(';')[0].trim();
    if (commonNames.es) return commonNames.es.split(';')[0].trim();
    if (commonNames.other) return commonNames.other.split(';')[0].trim();
    
    return '';
  }

  determineCropType(botanicalName: string): string {
    const name = botanicalName.toLowerCase();
    
    if (name.includes('triticum') || name.includes('zea') || name.includes('oryza')) {
      return 'Cereal';
    }
    if (name.includes('solanum') || name.includes('allium') || name.includes('brassica')) {
      return 'Vegetable';
    }
    if (name.includes('malus') || name.includes('prunus') || name.includes('citrus')) {
      return 'Fruit';
    }
    if (name.includes('rosa') || name.includes('lilium') || name.includes('tulipa')) {
      return 'Ornamental';
    }
    
    return 'Other';
  }

  getPlaceholderImage(): string {
    const images = ['./emp1.png', './h.png', './a1.png', './k.png', './r.jpg', './emp.png'];
    return images[Math.floor(Math.random() * images.length)];
  }

  getFlagUrl(isoCode: string): string {
    if (!isoCode || isoCode === '-' || isoCode.length !== 2) {
      return '';
    }
    if (isoCode === 'QZ') return ''; // EU doesn't have standard flag
    
    return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
  }

  // ------------------------------------
  // NAVIGATION
  // ------------------------------------
  navigateToSpecies(genieId: string): void {
    this.router.navigate(['/species', genieId]);
  }

  navigateBack(): void {
    this.router.navigate(['/genie']);
  }

  // ------------------------------------
  // AUTO SEARCH
  // ------------------------------------
  filterProducts(value: string) {
    const search = value.trim().toLowerCase();

    if (!search) {
      this.displayProducts = [...this.allProducts];
      this.currentPage = 1;
      return;
    }

    this.displayProducts = this.allProducts.filter(p =>
      p.upovCode.toLowerCase().includes(search) ||
      p.botanicalName.toLowerCase().includes(search) ||
      (p.commonName && p.commonName.toLowerCase().includes(search)) ||
      (p.family && p.family.toLowerCase().includes(search))
    );

    this.currentPage = 1;
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.displayProducts = [...this.allProducts];
    this.currentPage = 1;
  }

  // ------------------------------------
  // TABS
  // ------------------------------------
  setTab(tab: string) {
    this.activeTab = tab;
    this.clearSearch();
  }

  // ------------------------------------
  // PAGINATION
  // ------------------------------------
  getPaginatedProducts(): ProductDisplay[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.displayProducts.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.displayProducts.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    return this.displayProducts.length > this.itemsPerPage;
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
}