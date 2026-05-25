import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { NotificationBellComponent } from '../../features/notifications/component/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, TranslatePipe, NotificationBellComponent],
  template: `
    <header class="sticky top-0 z-50 glass-header shadow-sm transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 sm:h-20">
          
          <!-- Logo Section -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="flex items-center space-x-2">
              <span class="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-brand-fuchsia-dark to-brand-fuchsia bg-clip-text text-transparent font-serif">
                {{ 'nav.brand' | translate }}
              </span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex space-x-8 text-sm font-medium">
            <a routerLink="/products" routerLinkActive="text-brand-fuchsia" class="text-brand-charcoal hover:text-brand-fuchsia transition-colors duration-200 py-2">
              {{ 'nav.products' | translate }}
            </a>
            <a routerLink="/products" [queryParams]="{ skinConcern: 'Mụn' }" class="text-brand-charcoal hover:text-brand-fuchsia transition-colors duration-200 py-2">
              {{ 'footer.colShopAcne' | translate }}
            </a>
            <a routerLink="/products" [queryParams]="{ skinConcern: 'Lão Hóa' }" class="text-brand-charcoal hover:text-brand-fuchsia transition-colors duration-200 py-2">
              {{ 'footer.colShopAging' | translate }}
            </a>
            <a routerLink="/products" [queryParams]="{ categoryId: 1 }" class="text-brand-charcoal hover:text-brand-fuchsia transition-colors duration-200 py-2">
              {{ 'footer.colShopSerum' | translate }}
            </a>
            <a routerLink="/flash-sales" class="text-rose-500 font-bold hover:text-brand-fuchsia transition-colors duration-200 py-2 flex items-center space-x-1">
              <span>⚡</span>
              <span>Flash Sale</span>
            </a>
            <a routerLink="/routine" class="text-emerald-600 font-bold hover:text-brand-fuchsia transition-colors duration-200 py-2 flex items-center space-x-1">
              <span>✨</span>
              <span>Liệu trình</span>
            </a>
          </nav>

          <!-- Search Bar & Icons -->
          <div class="flex items-center space-x-3 sm:space-x-4">
            
            <!-- Language Switcher -->
            <div class="flex items-center space-x-1 border border-brand-fuchsia-light/20 rounded-full px-2.5 py-1 bg-white/40 backdrop-blur-sm shadow-sm text-[10px] font-bold text-brand-charcoal shrink-0">
              <button (click)="lang.setLanguage('vi')" [class.text-brand-fuchsia]="lang.currentLang() === 'vi'" class="hover:text-brand-fuchsia px-1 transition-colors focus:outline-none">VI</button>
              <span class="text-stone-300">|</span>
              <button (click)="lang.setLanguage('en')" [class.text-brand-fuchsia]="lang.currentLang() === 'en'" class="hover:text-brand-fuchsia px-1 transition-colors focus:outline-none">EN</button>
            </div>

            <!-- Search Input -->
            <form (ngSubmit)="onSearch()" class="hidden lg:block relative max-w-xs">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                name="query"
                [placeholder]="'nav.searchPlaceholder' | translate" 
                class="w-40 xl:w-52 px-4 py-2 text-xs rounded-full border border-brand-fuchsia-light/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-brand-fuchsia focus:border-transparent transition-all duration-300"
              />
              <button type="submit" class="absolute right-3 top-2.5 text-brand-muted hover:text-brand-fuchsia">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </form>

            <!-- Cart Icon with Flyout trigger -->
            <div class="relative">
              <button 
                (click)="toggleCartDropdown()" 
                class="p-2 text-brand-charcoal hover:text-brand-fuchsia relative rounded-full hover:bg-brand-rosewater transition-all duration-300 focus:outline-none"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                
                @if (cartItemsCount() > 0) {
                  <span class="absolute top-0 right-0 bg-brand-fuchsia text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-glow shadow">
                    {{ cartItemsCount() }}
                  </span>
                }
              </button>

              <!-- Mini-Cart Dropdown -->
              @if (isCartOpen()) {
                <div class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-skincare shadow-xl border border-brand-fuchsia-light/20 p-4 animate-fade-in z-50 text-xs">
                  <h3 class="text-sm font-semibold text-brand-charcoal border-b pb-2 mb-3">
                    {{ lang.currentLang() === 'vi' ? 'Giỏ hàng của bạn' : 'Your Shopping Cart' }}
                  </h3>
                  
                  @if (cartItems().length === 0) {
                    <div class="text-center py-6">
                      <p class="text-sm text-brand-muted">
                        {{ lang.currentLang() === 'vi' ? 'Giỏ hàng đang trống.' : 'Your cart is currently empty.' }}
                      </p>
                      <a routerLink="/products" (click)="isCartOpen.set(false)" class="text-xs text-brand-fuchsia font-medium hover:underline mt-2 inline-block">
                        {{ lang.currentLang() === 'vi' ? 'Mua sắm ngay' : 'Shop now' }}
                      </a>
                    </div>
                  } @else {
                    <div class="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1">
                      @for (item of cartItems(); track item.productId + (item.variantId || 0)) {
                        <div class="flex items-center space-x-3 text-xs">
                          <img [src]="item.primaryImageUrl || 'assets/placeholder.jpg'" class="w-12 h-12 rounded object-cover border" />
                          <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-brand-charcoal truncate">{{ item.productName }}</h4>
                            @if (item.variantName) {
                              <p class="text-[10px] text-brand-muted mt-0.5">{{ item.variantName }}</p>
                            }
                            <p class="text-brand-muted mt-1">{{ item.quantity }} x <span class="text-brand-fuchsia-dark font-semibold">{{ item.price | currency:'VND':'symbol':'1.0-0' }}</span></p>
                          </div>
                          <button (click)="removeItem(item.productId, item.variantId)" class="text-brand-muted hover:text-red-500">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      }
                    </div>
                    
                    <div class="border-t pt-3 space-y-3">
                      <div class="flex justify-between text-sm font-semibold">
                        <span>{{ lang.currentLang() === 'vi' ? 'Tổng cộng:' : 'Subtotal:' }}</span>
                        <span class="text-brand-fuchsia-dark">{{ cartTotal() | currency:'VND':'symbol':'1.0-0' }}</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2 pt-1">
                        <a routerLink="/cart" (click)="isCartOpen.set(false)" class="text-center py-2 border border-brand-fuchsia text-brand-fuchsia rounded-full text-xs font-semibold hover:bg-brand-rosewater transition-all">
                          {{ lang.currentLang() === 'vi' ? 'Xem Giỏ Hàng' : 'View Cart' }}
                        </a>
                        <a routerLink="/checkout" (click)="isCartOpen.set(false)" class="text-center py-2 btn-fuchsia-glow rounded-full text-xs font-semibold">
                          {{ lang.currentLang() === 'vi' ? 'Thanh Toán' : 'Checkout' }}
                        </a>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Notification Bell -->
            <app-notification-bell></app-notification-bell>

            <!-- Profile / Account Icon -->
            <div class="relative">
              <button 
                (click)="toggleProfileDropdown()"
                class="flex items-center space-x-1 p-1 rounded-full hover:bg-brand-rosewater focus:outline-none transition-all duration-300"
              >
                @if (currentUser() && currentUser()?.avatarUrl) {
                  <img [src]="currentUser()?.avatarUrl" class="w-8 h-8 rounded-full object-cover border border-brand-fuchsia" />
                } @else {
                  <div class="p-1 rounded-full text-brand-charcoal hover:text-brand-fuchsia">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                }
              </button>

              <!-- Profile Dropdown Menu -->
              @if (isProfileOpen()) {
                <div class="absolute right-0 mt-3 w-56 bg-white rounded-skincare shadow-xl border border-brand-fuchsia-light/20 p-2 animate-fade-in z-50 text-xs">
                  @if (isAuthenticated()) {
                    <div class="px-3 py-2 border-b">
                      <p class="text-[10px] text-brand-muted">
                        {{ lang.currentLang() === 'vi' ? 'Đăng nhập bởi' : 'Logged in as' }}
                      </p>
                      <p class="text-sm font-semibold text-brand-charcoal truncate">{{ currentUser()?.fullName }}</p>
                      <div class="flex items-center mt-1 space-x-1.5">
                        <span class="bg-brand-fuchsia-light/30 text-brand-fuchsia-dark text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          {{ currentUser()?.membershipClass }}
                        </span>
                        <span class="text-[10px] text-brand-muted">{{ currentUser()?.points }} xu</span>
                      </div>
                    </div>
                    
                    <div class="py-1 text-xs text-brand-charcoal">
                      <a routerLink="/profile" (click)="isProfileOpen.set(false)" class="flex items-center px-3 py-2 hover:bg-brand-rosewater hover:text-brand-fuchsia rounded-lg transition-all font-semibold">
                        {{ lang.currentLang() === 'vi' ? 'Hồ sơ cá nhân' : 'Personal Profile' }}
                      </a>
                      <a routerLink="/orders" (click)="isProfileOpen.set(false)" class="flex items-center px-3 py-2 hover:bg-brand-rosewater hover:text-brand-fuchsia rounded-lg transition-all font-semibold">
                        {{ lang.currentLang() === 'vi' ? 'Lịch sử đơn hàng' : 'Order History' }}
                      </a>
                      @if (isAdmin()) {
                        <a routerLink="/admin" (click)="isProfileOpen.set(false)" class="flex items-center px-3 py-2 text-brand-fuchsia-dark font-extrabold hover:bg-brand-rosewater rounded-lg transition-all">
                          {{ lang.currentLang() === 'vi' ? 'Trang quản trị (Admin)' : 'Admin Dashboard' }}
                        </a>
                      }
                      <button (click)="logout()" class="w-full text-left flex items-center px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-semibold">
                        {{ lang.currentLang() === 'vi' ? 'Đăng xuất' : 'Logout' }}
                      </button>
                    </div>
                  } @else {
                    <div class="p-3 text-center">
                      <p class="text-[10px] text-brand-muted mb-3">
                        {{ lang.currentLang() === 'vi' ? 'Tận hưởng ưu đãi thành viên CalmSKIN' : 'Enjoy CalmSKIN member benefits' }}
                      </p>
                      <a routerLink="/login" (click)="isProfileOpen.set(false)" class="block text-center py-2 btn-fuchsia-glow rounded-full text-xs font-semibold mb-2">
                        {{ 'nav.login' | translate }}
                      </a>
                      <a routerLink="/register" (click)="isProfileOpen.set(false)" class="block text-center py-2 text-xs font-semibold text-brand-fuchsia hover:underline">
                        {{ lang.currentLang() === 'vi' ? 'Tạo Tài Khoản Mới' : 'Create New Account' }}
                      </a>
                    </div>
                  }
                </div>
              }
            </div>
            
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  readonly lang = inject(LanguageService);

  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly cartItems = this.cartService.cartItems;
  readonly cartItemsCount = this.cartService.totalItemsCount;
  readonly cartTotal = this.cartService.totalAmount;

  readonly isCartOpen = signal(false);
  readonly isProfileOpen = signal(false);
  searchQuery = '';

  toggleCartDropdown() {
    this.isCartOpen.set(!this.isCartOpen());
    this.isProfileOpen.set(false);
  }

  toggleProfileDropdown() {
    this.isProfileOpen.set(!this.isProfileOpen());
    this.isCartOpen.set(false);
  }

  removeItem(productId: number, variantId?: number) {
    this.cartService.removeFromCart(productId, variantId);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { query: this.searchQuery.trim() } });
      this.searchQuery = '';
      this.isCartOpen.set(false);
      this.isProfileOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.isProfileOpen.set(false);
    this.router.navigate(['/']);
  }
}
