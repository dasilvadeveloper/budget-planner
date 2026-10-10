import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  // PUBLIC (sem layout)
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },

  // PRIVATE (com layout)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'expenses',
        loadChildren: () => import('./features/expenses/expenses.routes').then((c) => c.routes),
      },
      {
        path: 'incomes',
        loadChildren: () => import('./features/incomes/incomes.routes').then((c) => c.routes),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // fallback
  {
    path: '**',
    redirectTo: 'login',
  },
];
