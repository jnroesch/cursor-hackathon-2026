import { Route } from '@angular/router';

export const PROJECT_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./project.component').then(m => m.ProjectComponent)
  }
];
