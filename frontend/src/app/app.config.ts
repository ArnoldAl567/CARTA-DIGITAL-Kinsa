import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter([
      {
        path: 'administrar',
        title: 'Administrar carta | Kinsa T’iqsi',
        loadComponent: () => import('./admin/admin').then((module) => module.Admin),
      },
      { path: '', component: App, pathMatch: 'full' },
      { path: '**', redirectTo: '' },
    ]),
  ],
};
