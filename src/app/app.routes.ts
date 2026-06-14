import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';
import { AdminLayoutComponent } from './shared/layouts/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { notificationRoutes } from './features/notifications/routes/notification.routes';

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
        path: 'forgot-password',
        loadComponent: () => import('./views/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./views/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
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
      },
      {
        path: 'flash-sales',
        loadComponent: () => import('./views/promotions/flash-sale-page.component').then(m => m.FlashSalePageComponent)
      },
      {
        path: 'profile/wishlist',
        loadComponent: () => import('./views/profile/wishlist/wishlist.component').then(m => m.WishlistComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile/vouchers',
        loadComponent: () => import('./views/profile/vouchers/vouchers.component').then(m => m.VouchersComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile/points',
        loadComponent: () => import('./views/profile/points/points-history.component').then(m => m.PointsHistoryComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile/sessions',
        loadComponent: () => import('./views/profile/sessions/sessions.component').then(m => m.SessionsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile/skin',
        loadComponent: () => import('./views/profile/skin-profile/skin-profile.component').then(m => m.SkinProfileComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile/reviews',
        loadComponent: () => import('./views/profile/reviews/my-reviews.component').then(m => m.MyReviewsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile/subscriptions',
        loadComponent: () => import('./views/profile/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'routine',
        loadComponent: () => import('./views/routine/routine.component').then(m => m.RoutineComponent)
      },
      {
        path: 'skin-analysis',
        loadComponent: () => import('./views/skin-analysis/skin-analysis.component').then(m => m.SkinAnalysisComponent),
        canActivate: [authGuard]
      },
      {
        path: 'products/compare',
        loadComponent: () => import('./views/product/compare/compare.component').then(m => m.CompareComponent)
      },
      {
        path: 'notifications',
        children: notificationRoutes
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
        path: 'payments',
        loadComponent: () => import('./views/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./views/admin/inventory/admin-inventory.component').then(m => m.AdminInventoryComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./views/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'promotions',
        loadComponent: () => import('./views/admin/promotions/admin-promotions.component').then(m => m.AdminPromotionsComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./views/admin/reviews/admin-reviews.component').then(m => m.AdminReviewsComponent)
      },
      {
        path: 'shipments',
        loadComponent: () => import('./views/admin/shipments/admin-shipments.component').then(m => m.AdminShipmentsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/component/admin-notifications.component').then(m => m.AdminNotificationsComponent)
      }
    ]
  },

  // Fallback wildcard routing back to home page
  {
    path: '**',
    redirectTo: ''
  }
];
