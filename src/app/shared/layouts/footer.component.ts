import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <footer class="bg-white border-t border-brand-fuchsia-light/10 mt-12 py-10 md:py-16 text-xs text-brand-muted">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Commitment Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b pb-8 md:pb-12 mb-8 md:mb-12">
          <div class="flex items-start space-x-3">
            <div class="p-2 rounded-full bg-brand-rosewater text-brand-fuchsia">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <h4 class="font-semibold text-brand-charcoal text-sm">{{ 'footer.badgeAuthenticTitle' | translate }}</h4>
              <p class="mt-1">{{ 'footer.badgeAuthenticDesc' | translate }}</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="p-2 rounded-full bg-brand-rosewater text-brand-fuchsia">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            </div>
            <div>
              <h4 class="font-semibold text-brand-charcoal text-sm">{{ 'footer.badgeShippingTitle' | translate }}</h4>
              <p class="mt-1">{{ 'footer.badgeShippingDesc' | translate }}</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="p-2 rounded-full bg-brand-rosewater text-brand-fuchsia">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2"></path></svg>
            </div>
            <div>
              <h4 class="font-semibold text-brand-charcoal text-sm">{{ 'footer.badgeReturnTitle' | translate }}</h4>
              <p class="mt-1">{{ 'footer.badgeReturnDesc' | translate }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Column 1: Intro -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold font-serif tracking-wide text-brand-fuchsia-dark">CalmSKIN</h3>
            <p class="leading-relaxed">{{ 'footer.desc' | translate }}</p>
            <p class="text-[10px] text-brand-muted">© 2026 CalmSKIN. All rights reserved.</p>
          </div>

          <!-- Column 2: Links -->
          <div>
            <h4 class="text-sm font-semibold text-brand-charcoal mb-4">{{ 'footer.colShop' | translate }}</h4>
            <ul class="space-y-2 font-medium">
              <li><a routerLink="/products" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colShopAll' | translate }}</a></li>
              <li><a routerLink="/products" [queryParams]="{ skinConcern: 'Mụn' }" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colShopAcne' | translate }}</a></li>
              <li><a routerLink="/products" [queryParams]="{ skinConcern: 'Lão Hóa' }" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colShopAging' | translate }}</a></li>
              <li><a routerLink="/products" [queryParams]="{ categoryId: 1 }" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colShopSerum' | translate }}</a></li>
            </ul>
          </div>

          <!-- Column 3: Policy -->
          <div>
            <h4 class="text-sm font-semibold text-brand-charcoal mb-4">{{ 'footer.colPolicy' | translate }}</h4>
            <ul class="space-y-2 font-medium">
              <li><a href="#" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colPolicyTerm' | translate }}</a></li>
              <li><a href="#" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colPolicyPrivacy' | translate }}</a></li>
              <li><a href="#" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colPolicyReturn' | translate }}</a></li>
              <li><a href="#" class="hover:text-brand-fuchsia transition-colors">{{ 'footer.colPolicyLoyalty' | translate }}</a></li>
            </ul>
          </div>

          <!-- Column 4: Newsletters -->
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-brand-charcoal">{{ 'footer.colNewsletter' | translate }}</h4>
            <p>{{ 'footer.newsletterDesc' | translate }}</p>
            <div class="flex">
              <input 
                type="email" 
                [placeholder]="'footer.newsletterPlaceholder' | translate" 
                class="flex-1 px-3 py-2 border border-brand-fuchsia-light/40 rounded-l-full focus:outline-none focus:ring-1 focus:ring-brand-fuchsia bg-brand-champagne/50 font-medium"
              />
              <button class="px-4 py-2 bg-brand-fuchsia text-white rounded-r-full hover:bg-brand-fuchsia-dark transition-colors font-bold">
                {{ 'footer.newsletterSend' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
