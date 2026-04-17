import { Routes } from '@angular/router';
<<<<<<< Updated upstream

export const routes: Routes = [];
=======
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'drugs',
    loadComponent: () =>
      import('./features/drugs/drug-list/drug-list').then((m) => m.DrugListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'drugs/add',
    loadComponent: () =>
      import('./features/drugs/drug-form/drug-form').then((m) => m.DrugFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'drugs/edit/:id',
    loadComponent: () =>
      import('./features/drugs/drug-form/drug-form').then((m) => m.DrugFormComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];
>>>>>>> Stashed changes
