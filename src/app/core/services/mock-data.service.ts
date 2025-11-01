// src/app/core/services/mock-data.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Variety, Country, Species } from '../models/variety.model';
import { MOCK_VARIETIES } from '../data/mock-varieties';
import { COUNTRIES } from '../data/countries';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private species: Species[] = [
    { latinName: 'Solanum tuberosum', upovCode: 'SOLTU' },
    { latinName: 'Triticum aestivum', upovCode: 'TRIAE' },
    { latinName: 'Rosa hybrida', upovCode: 'ROSHY' },
    { latinName: 'Vitis vinifera', upovCode: 'VITVI' },
    { latinName: 'Lycopersicon esculentum', upovCode: 'LYCES' },
    { latinName: 'Hordeum vulgare', upovCode: 'HORVU' },
    { latinName: 'Zea mays', upovCode: 'ZEAXX' },
    { latinName: 'Brassica oleracea', upovCode: 'BRAOL' },
    { latinName: 'Oryza sativa', upovCode: 'ORYSA' },
    { latinName: 'Prunus persica', upovCode: 'PRUPE' },
    { latinName: 'Solanum lycopersicum L.', upovCode: 'SOLAN_LYC' },
    { latinName: 'Echinacea purpurea (L.) Moench x E. paradoxa (Norton) Britton', upovCode: 'ECNCE_PPA' },
    { latinName: 'Echinacea spp.', upovCode: 'ECNCE' },
    { latinName: 'Solanum lycopersicum L. var. lycopersicum', upovCode: 'SOLAN_LYC_LYC' }
  ];

  getVarieties(): Variety[] {
    return MOCK_VARIETIES;
  }

  getCountries(): Country[] {
    return COUNTRIES;
  }

  // Simulate server-side search with delay
  searchSpecies(query: string): Observable<Species[]> {
    console.log('🔍 Server-side search for:', query);
    
    const filtered = this.species.filter(s =>
      s.latinName.toLowerCase().includes(query.toLowerCase()) ||
      s.upovCode.toLowerCase().includes(query.toLowerCase())
    );

    // Simulate network delay
    return of(filtered).pipe(delay(500));
  }
}