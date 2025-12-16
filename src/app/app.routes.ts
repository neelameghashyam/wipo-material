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
   path: 'header',
    loadComponent: () => import('./shared/header/header')
      .then(m => m.Header)
  }
];