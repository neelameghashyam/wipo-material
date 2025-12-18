import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'genie',
    pathMatch: 'full'
  },
  {
    path: 'genie',
    loadComponent: () => import('./pages/genie/genie')
      .then(m => m.Genie)
  },
  {
    path: 'genie/species',
    loadComponent: () => import('./pages/genie/genie-species-results/genie-species-results')
      .then(m => m.GenieSpeciesResults)
  },
  {
    path: 'genie/authorities',
    loadComponent: () => import('./pages/genie/genie-authority-results/genie-authority-results')
      .then(m => m.GenieAuthorityResults)
  }
];