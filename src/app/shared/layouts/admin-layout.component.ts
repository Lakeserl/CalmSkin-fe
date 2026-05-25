import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="min-h-screen bg-stone-100 flex flex-col md:flex-row animate-fade-in">
      <!-- Admin Sidebar -->
      <aside class="w-full md:w-64 bg-stone-900 text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          <!-- Sidebar Header -->
          <div class="px-6 py-6 border-b border-stone-800 flex items-center justify-between">
            <a routerLink="/" class="flex flex-col">
              <span class="text-xl font-extrabold font-serif bg-gradient-to-r from-brand-fuchsia-light to-brand-fuchsia bg-clip-text text-transparent">
                CalmSKIN Portal
              </span>
              <span class="text-[10px] text-stone-400 mt-0.5 tracking-wider uppercase font-bold">
                {{ 'admin.portalTitle' | translate }}
              </span>
            </a>
          </div>

          <!-- Sidebar Nav links -->
          <nav class="px-4 py-6 space-y-1 text-sm font-semibold">
            <a 
              routerLink="/admin" 
              [routerLinkActiveOptions]="{exact: true}"
              routerLinkActive="bg-brand-fuchsia text-white" 
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
              <span>{{ 'admin.menuOverview' | translate }}</span>
            </a>
            
            <a 
              routerLink="/admin/products" 
              routerLinkActive="bg-brand-fuchsia text-white" 
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              <span>{{ 'admin.menuProducts' | translate }}</span>
            </a>

            <a
              routerLink="/admin/orders"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              <span>{{ 'admin.menuOrders' | translate }}</span>
            </a>

            <a
              routerLink="/admin/shipments"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
              <span>Vận chuyển</span>
            </a>

            <a
              routerLink="/admin/payments"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              <span>Thanh Toán</span>
            </a>

            <a
              routerLink="/admin/inventory"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <span>{{ 'admin.menuInventory' | translate }}</span>
            </a>

            <a
              routerLink="/admin/users"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-4-4H7m10-6a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>Users</span>
            </a>

            <a
              routerLink="/admin/promotions"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              <span>Promotions</span>
            </a>

            <a
              routerLink="/admin/reviews"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 9.10c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z"></path></svg>
              <span>Reviews</span>
            </a>

            <a
              routerLink="/admin/notifications"
              routerLinkActive="bg-brand-fuchsia text-white"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span>Notifications</span>
            </a>
          </nav>
        </div>

        <!-- Sidebar Footer actions -->
        <div class="p-4 border-t border-stone-800 text-xs">
          <div class="px-4 py-3 bg-stone-800/50 rounded-xl mb-4">
            <p class="text-stone-400 font-medium">{{ 'admin.activeAdmin' | translate }}</p>
            <p class="font-extrabold text-stone-200 mt-0.5 truncate">{{ currentUser()?.fullName }}</p>
          </div>
          <button 
            (click)="goBackToStore()" 
            class="w-full text-center py-2.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-brand-fuchsia-light font-bold transition-all focus:outline-none"
          >
            {{ 'admin.backToStore' | translate }}
          </button>
        </div>
      </aside>

      <!-- Main Admin Content Area -->
      <main class="flex-1 p-6 md:p-10 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly lang = inject(LanguageService);

  readonly currentUser = this.authService.currentUser;

  goBackToStore() {
    this.router.navigate(['/']);
  }
}
