import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'material-results',
    pathMatch: 'full'
  },
  {
    path: 'material-results',
    loadComponent: () => import('./material-results/material-results')
      .then(m => m.MaterialResultsComponent)
  }
 
];