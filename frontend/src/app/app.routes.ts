import { Route } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
  },
  {
    path: 'project/:projectId',
    canActivate: [authGuard],
    loadChildren: () => import('./features/project/project.routes').then(m => m.PROJECT_ROUTES)
  },
  {
    path: 'editor/:documentId',
    canActivate: [authGuard],
    loadChildren: () => import('./features/editor/editor.routes').then(m => m.EDITOR_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
