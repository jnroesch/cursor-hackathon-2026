import { Route } from '@angular/router';

export const EDITOR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'proposal/:proposalId',
    loadComponent: () => import('./editor.component').then(m => m.EditorComponent)
  }
];
