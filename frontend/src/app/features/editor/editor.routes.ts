import { Route } from '@angular/router';

export const EDITOR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./editor.component').then(m => m.EditorComponent)
  }
];
