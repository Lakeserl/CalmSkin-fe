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
              routerLink="/admin/inventory" 
              routerLinkActive="bg-brand-fuchsia text-white" 
              class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <span>{{ 'admin.menuInventory' | translate }}</span>
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
