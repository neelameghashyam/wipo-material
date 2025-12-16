import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  @Input() lang: string = 'en';
  @Input() breadcrumbLevel: string | null = null;
  @Input() breadcrumbText: string | null = null;
  @Input() breadcrumbLink: string | null = null;

  activeDropdown: string | null = null;

  // Translated strings for breadcrumbs
  get translations() {
    const translations: { [key: string]: any } = {
      en: {
        findExplore: 'Find & Explore',
        databases: 'Databases',
        genieHome: 'GENIE Database',
        searchResults: 'Search Results',
        authorities: 'Authorities',
        authorityDetails: 'Authority Details'
      },
      fr: {
        findExplore: 'Trouver & Explorer',
        databases: 'Bases de données',
        genieHome: 'Base de données GENIE',
        searchResults: 'Résultats de recherche',
        authorities: 'Services',
        authorityDetails: 'Détails du service'
      },
      es: {
        findExplore: 'Buscar y Explorar',
        databases: 'Bases de datos',
        genieHome: 'Base de datos GENIE',
        searchResults: 'Resultados de búsqueda',
        authorities: 'Autoridades',
        authorityDetails: 'Detalles de la autoridad'
      },
      de: {
        findExplore: 'Finden & Erkunden',
        databases: 'Datenbanken',
        genieHome: 'GENIE-Datenbank',
        searchResults: 'Suchergebnisse',
        authorities: 'Behörden',
        authorityDetails: 'Behördendetails'
      }
    };
    return translations[this.lang] || translations['en'];
  }

  toggleDropdown(dropdownName: string): void {
    if (this.activeDropdown === dropdownName) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdownName;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-item')) {
      this.activeDropdown = null;
    }
  }
}