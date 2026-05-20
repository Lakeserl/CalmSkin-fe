import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { AdminLayoutComponent } from './shared/layouts/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Customer facing pages (wrapped with Header/Footer)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./views/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./views/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./views/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./views/product/list/list.component').then(m => m.ListComponent)
      },
      {
        path: 'products/:slug',
        loadComponent: () => import('./views/product/detail/detail.component').then(m => m.DetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./views/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./views/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [authGuard]
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/orders/history/history.component').then(m => m.HistoryComponent),
        canActivate: [authGuard]
      },
      {
        path: 'orders/:orderNumber',
        loadComponent: () => import('./views/orders/detail/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./views/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      }
    ]
  },

  // Back-office Admin portal (wrapped with dark-mode sidebar layout)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./views/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./views/admin/products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./views/admin/inventory/admin-inventory.component').then(m => m.AdminInventoryComponent)
      }
    ]
  },

  // Fallback wildcard routing back to home page
  {
    path: '**',
    redirectTo: ''
  }
];
