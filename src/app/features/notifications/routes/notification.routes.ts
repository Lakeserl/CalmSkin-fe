import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';

export const notificationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../component/notification-page.component').then((m) => m.NotificationPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'preferences',
    loadComponent: () =>
      import('../component/notification-preferences.component').then((m) => m.NotificationPreferencesComponent),
    canActivate: [authGuard],
  },
];
