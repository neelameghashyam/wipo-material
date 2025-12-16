import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true
})
export class Footer {
  @Input() lang: string = 'en';

  // Translated strings
  get translations() {
    const translations: { [key: string]: any } = {
      en: {
        termsOfUse: 'Terms of Use',
        privacy: 'Privacy',
        sitemap: 'Sitemap',
        accessibility: 'Accessibility',
        description: 'UPOV promotes plant breeding worldwide by protecting new plant varieties, contributing to sustainable development and global food security.'
      },
      fr: {
        termsOfUse: "Conditions d'utilisation",
        privacy: 'Confidentialité',
        sitemap: 'Plan du site',
        accessibility: 'Accessibilité',
        description: 'UPOV promotes plant breeding worldwide by protecting new plant varieties, contributing to sustainable development and global food security.'
      },
      es: {
        termsOfUse: 'Condiciones de uso',
        privacy: 'Privacidad',
        sitemap: 'Mapa del sitio',
        accessibility: 'Accesibilidad',
        description: 'UPOV promotes plant breeding worldwide by protecting new plant varieties, contributing to sustainable development and global food security.'
      },
      de: {
        termsOfUse: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
        sitemap: 'Sitemap',
        accessibility: 'Barrierefreiheit',
        description: 'UPOV promotes plant breeding worldwide by protecting new plant varieties, contributing to sustainable development and global food security.'
      }
    };
    return translations[this.lang] || translations['en'];
  }
}