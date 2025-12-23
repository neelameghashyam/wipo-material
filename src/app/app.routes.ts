import { Routes } from '@angular/router';
import { Genie } from './pages/genie/genie';
import { SpecieDetails } from './pages/specie-details/specie-details';
import { AuthorityDetails } from './pages/authority-details/authority-details';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/genie',
    pathMatch: 'full'
  },
  {
    path: 'genie',
    component: Genie
  },
  {
    path: 'species/:id',
    component: SpecieDetails
  },
  {
    path: 'authority/:id',
    component: AuthorityDetails
  },

  {
    path: '**',
    redirectTo: '/genie'
  }
];