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
  }
  // Removed separate routes for species and authorities 
  // as they now render within the main genie component
];