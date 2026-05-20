import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ProductSummaryDTO } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="space-y-16 md:space-y-24 pb-20">
      
      <!-- Hero Banner Section -->
      <section class="relative overflow-hidden bg-gradient-to-br from-brand-rosewater via-brand-champagne to-white py-12 sm:py-20 lg:py-28 animate-fade-in">
        <div class="absolute inset-0 z-0 opacity-30">
          <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-fuchsia-light blur-3xl"></div>
          <div class="absolute top-60 -left-20 w-80 h-80 rounded-full bg-pink-200 blur-3xl"></div>
        </div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-6 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <span class="inline-block bg-brand-fuchsia/10 text-brand-fuchsia-dark text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {{ 'home.bannerSub' | translate }}
              </span>
              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif text-brand-charcoal leading-tight">
                @if (lang.currentLang() === 'vi') {
                  Nâng niu vẻ đẹp <br/>
                  <span class="bg-gradient-to-r from-brand-fuchsia-dark to-brand-fuchsia bg-clip-text text-transparent">Làn Da Thuần Khiết</span>
                } @else {
                  Rejuvenating <br/>
                  <span class="bg-gradient-to-r from-brand-fuchsia-dark to-brand-fuchsia bg-clip-text text-transparent">Natural Vitality</span>
                }
              </h1>
              <p class="text-sm sm:text-base text-brand-muted leading-relaxed">
                {{ 'home.bannerDesc' | translate }}
              </p>
              <div class="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a routerLink="/products" class="w-full sm:w-auto px-8 py-3.5 btn-fuchsia-glow rounded-full text-sm font-bold text-center">
                  {{ 'home.shopNow' | translate }}
                </a>
                <a routerLink="/products" [queryParams]="{ skinConcern: 'Mụn' }" class="w-full sm:w-auto px-8 py-3.5 border border-brand-fuchsia-light text-brand-fuchsia-dark bg-white/50 hover:bg-brand-rosewater rounded-full text-sm font-bold text-center transition-all">
                  {{ lang.currentLang() === 'vi' ? 'Dòng Da Mụn nhạy cảm' : 'Sensitive Acne Solutions' }}
                </a>
              </div>
            </div>
            
            <!-- Hero Image Showcase -->
            <div class="relative max-w-md mx-auto lg:max-w-none animate-skincare-float">
              <div class="absolute inset-0 bg-gradient-to-tr from-brand-fuchsia/20 to-transparent rounded-full blur-2xl opacity-50"></div>
              <img 
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600" 
                alt="CalmSkin Skincare Showcase" 
                class="rounded-skincare shadow-2xl relative z-10 border border-white max-h-[450px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Skin Concerns Guide Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-3 mb-10">
          <h2 class="text-2xl sm:text-3xl font-serif text-brand-charcoal">
            {{ lang.currentLang() === 'vi' ? 'Thiết Kế Cho Làn Da Bạn' : 'Tailored Skin Care Solutions' }}
          </h2>
          <p class="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto">
            {{ lang.currentLang() === 'vi' ? 'Lựa chọn đúng giải pháp đặc trị dịu nhẹ được các bác sĩ da liễu khuyên dùng theo từng vấn đề da.' : 'Choose targeted, highly dermatological and safe remedies recommended by skin doctors.' }}
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          @for (concern of concernsList; track concern.query.skinConcern) {
            <a 
              [routerLink]="['/products']" 
              [queryParams]="concern.query"
              class="glass-card p-6 rounded-skincare text-center hover:border-brand-fuchsia hover:shadow-md transition-all duration-300 group"
            >
              <div class="w-12 h-12 rounded-full bg-brand-rosewater text-brand-fuchsia flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span [innerHTML]="concern.icon"></span>
              </div>
              <h3 class="font-semibold text-brand-charcoal text-sm group-hover:text-brand-fuchsia-dark transition-colors">
                {{ lang.currentLang() === 'vi' ? concern.titleVi : concern.titleEn }}
              </h3>
              <p class="text-[10px] text-brand-muted mt-1 leading-relaxed">
                {{ lang.currentLang() === 'vi' ? concern.descVi : concern.descEn }}
              </p>
            </a>
          }
        </div>
      </section>

      <!-- Best Sellers Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-8">
          <div class="space-y-1">
            <h2 class="text-2xl sm:text-3xl font-serif text-brand-charcoal">{{ 'home.bestSellers' | translate }}</h2>
            <p class="text-xs sm:text-sm text-brand-muted">{{ 'home.bestSellersSub' | translate }}</p>
          </div>
          <a routerLink="/products" class="text-xs font-semibold text-brand-fuchsia hover:text-brand-fuchsia-dark flex items-center space-x-1 hover:underline">
            <span>{{ lang.currentLang() === 'vi' ? 'Xem tất cả' : 'View all' }}</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          @for (product of bestSellers(); track product.id) {
            <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-brand-fuchsia/40 transition-all duration-300 flex flex-col justify-between group relative">
              
              <!-- Badge -->
              <span class="absolute top-3 left-3 z-10 bg-brand-fuchsia text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {{ lang.currentLang() === 'vi' ? 'Bán Chạy' : 'Hot Item' }}
              </span>

              <!-- Product Image -->
              <a [routerLink]="['/products', product.slug]" class="block overflow-hidden rounded-xl mb-3 aspect-square bg-brand-champagne">
                <img 
                  [src]="product.primaryImageUrl || 'assets/placeholder.jpg'" 
                  [alt]="product.name" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              <!-- Product info -->
              <div class="space-y-1.5 flex-grow flex flex-col justify-between">
                <div>
                  <p class="text-[10px] text-brand-muted uppercase font-semibold tracking-wider">{{ product.brandName }}</p>
                  <a [routerLink]="['/products', product.slug]" class="block">
                    <h3 class="font-semibold text-brand-charcoal text-xs sm:text-sm line-clamp-2 group-hover:text-brand-fuchsia-dark transition-colors">{{ product.name }}</h3>
                  </a>
                </div>

                <div>
                  <!-- Star rating -->
                  <div class="flex items-center space-x-1 text-[10px] text-amber-400">
                    <div class="flex">
                      @for (star of [1,2,3,4,5]; track star) {
                        <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                      }
                    </div>
                    <span class="text-brand-muted">({{ product.totalReviews || 12 }})</span>
                  </div>

                  <!-- Price & Buy Button -->
                  <div class="flex items-center justify-between pt-2 border-t border-stone-50 mt-2">
                    <div class="flex flex-col">
                      <span class="text-xs sm:text-sm font-bold text-brand-fuchsia-dark">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                      @if (product.originalPrice && product.originalPrice > product.price) {
                        <span class="text-[10px] text-brand-muted line-through">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                      }
                    </div>
                    <button 
                      (click)="addToCart(product)" 
                      class="p-2 bg-brand-rosewater text-brand-fuchsia hover:bg-brand-fuchsia hover:text-white rounded-full transition-all duration-300 focus:outline-none"
                      [title]="'home.addToCart' | translate"
                    >
                      <svg class="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- CTA Promotional Banner Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-skincare overflow-hidden bg-gradient-to-r from-brand-fuchsia-dark via-purple-700 to-brand-fuchsia text-white p-8 md:p-12 shadow-xl animate-fade-in">
          <div class="absolute inset-0 opacity-15">
            <div class="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-2xl"></div>
          </div>
          <div class="relative z-10 max-w-xl space-y-6">
            <h2 class="text-2xl md:text-4xl font-serif leading-tight">
              {{ lang.currentLang() === 'vi' ? 'Chăm Sóc Da Chuẩn Khoa Học Trải Nghiệm Khác Biệt' : 'Scientific Clinical Skincare - Real Visual Difference' }}
            </h2>
            <p class="text-xs md:text-sm text-pink-100 leading-relaxed">
              {{ lang.currentLang() === 'vi' ? 'Nhận ngay tư vấn thói quen Skincare sáng & tối chuyên sâu được thiết lập bởi các chuyên gia da liễu hàng đầu dựa trên chỉ số da của bạn khi mua các dòng sản phẩm đặc trị CalmSKIN.' : 'Unlock full AM & PM advanced routines set up by leading skin dermatologists specifically for your skin profiles upon purchase of CalmSKIN formulas.' }}
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a routerLink="/products" class="px-6 py-3 bg-white text-brand-fuchsia-dark hover:bg-pink-100 transition-colors rounded-full text-xs font-bold shadow-md">
                {{ 'home.shopNow' | translate }}
              </a>
              <span class="text-xs text-pink-200">
                {{ lang.currentLang() === 'vi' ? 'Giao hàng hoả tốc 2H tại TP.HCM & Hà Nội' : '2-hour priority delivery in major cities' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- New Arrivals Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-8">
          <div class="space-y-1">
            <h2 class="text-2xl sm:text-3xl font-serif text-brand-charcoal">{{ 'home.newArrivals' | translate }}</h2>
            <p class="text-xs sm:text-sm text-brand-muted">{{ 'home.newArrivalsSub' | translate }}</p>
          </div>
          <a routerLink="/products" [queryParams]="{ sortBy: 'createdAt,desc' }" class="text-xs font-semibold text-brand-fuchsia hover:text-brand-fuchsia-dark flex items-center space-x-1 hover:underline">
            <span>{{ lang.currentLang() === 'vi' ? 'Xem tất cả' : 'View all' }}</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          @for (product of newArrivals(); track product.id) {
            <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-brand-fuchsia/40 transition-all duration-300 flex flex-col justify-between group relative">
              
              <!-- Badge -->
              <span class="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {{ lang.currentLang() === 'vi' ? 'Mới' : 'New' }}
              </span>

              <!-- Product Image -->
              <a [routerLink]="['/products', product.slug]" class="block overflow-hidden rounded-xl mb-3 aspect-square bg-brand-champagne">
                <img 
                  [src]="product.primaryImageUrl || 'assets/placeholder.jpg'" 
                  [alt]="product.name" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>

              <!-- Product info -->
              <div class="space-y-1.5 flex-grow flex flex-col justify-between">
                <div>
                  <p class="text-[10px] text-brand-muted uppercase font-semibold tracking-wider">{{ product.brandName }}</p>
                  <a [routerLink]="['/products', product.slug]" class="block">
                    <h3 class="font-semibold text-brand-charcoal text-xs sm:text-sm line-clamp-2 group-hover:text-brand-fuchsia-dark transition-colors">{{ product.name }}</h3>
                  </a>
                </div>

                <div>
                  <!-- Star rating -->
                  <div class="flex items-center space-x-1 text-[10px] text-amber-400">
                    <div class="flex">
                      @for (star of [1,2,3,4,5]; track star) {
                        <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                      }
                    </div>
                    <span class="text-brand-muted">({{ product.totalReviews || 4 }})</span>
                  </div>

                  <!-- Price & Buy Button -->
                  <div class="flex items-center justify-between pt-2 border-t border-stone-50 mt-2">
                    <div class="flex flex-col">
                      <span class="text-xs sm:text-sm font-bold text-brand-fuchsia-dark">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                    </div>
                    <button 
                      (click)="addToCart(product)" 
                      class="p-2 bg-brand-rosewater text-brand-fuchsia hover:bg-brand-fuchsia hover:text-white rounded-full transition-all duration-300 focus:outline-none"
                      [title]="'home.addToCart' | translate"
                    >
                      <svg class="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  readonly lang = inject(LanguageService);

  readonly bestSellers = signal<ProductSummaryDTO[]>([]);
  readonly newArrivals = signal<ProductSummaryDTO[]>([]);

  readonly concernsList = [
    { 
      titleVi: 'Trị Mụn & Kiềm Dầu', 
      titleEn: 'Acne & Sebum Control',
      descVi: 'Giảm sưng viêm, bã nhờn', 
      descEn: 'Reduce redness & clear oils',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>',
      query: { skinConcern: 'Mụn' } 
    },
    { 
      titleVi: 'Dưỡng Sáng & Mờ Thâm', 
      titleEn: 'Brightening Booster',
      descVi: 'Niacinamide làm đều màu', 
      descEn: 'Even out pigmentation',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-3.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>',
      query: { skinConcern: 'Sạm Nám' } 
    },
    { 
      titleVi: 'Cấp Ẩm Phục Hồi', 
      titleEn: 'Barrier Hydration',
      descVi: 'B5 & HA làm dịu rát da', 
      descEn: 'Soothe sensitive skin limits',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"></path></svg>',
      query: { skinConcern: 'Phục Hồi' } 
    },
    { 
      titleVi: 'Chống Lão Hóa', 
      titleEn: 'Cellular Anti-Aging',
      descVi: 'Retinol cải thiện nếp nhăn', 
      descEn: 'Diminish fine lines & age',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
      query: { skinConcern: 'Lão Hóa' } 
    }
  ];

  // Backup mock data if API is empty/clean
  private readonly mockBestSellers: ProductSummaryDTO[] = [
    {
      id: 1,
      name: 'Tinh chất Trị Mụn BHA 2% Salicylic Acid Acne Clearing Serum',
      slug: 'tinh-chat-tri-mun-bha-2-percent',
      shortDescription: 'Tinh chất gom cồi mụn, sạch bã nhờn bít tắc và ngăn ngừa mụn tái phát.',
      categoryName: 'Serum',
      brandName: 'CalmSKIN Lab',
      price: 299000,
      originalPrice: 350000,
      discountPercent: 15,
      primaryImageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['BHA', 'Trị Mụn', 'Kiềm Dầu'],
      averageRating: 4.8,
      totalReviews: 84,
      soldCount: 1205
    },
    {
      id: 2,
      name: 'Kem dưỡng Phục Hồi Làm Dịu Da Tổn Thương Panthenol B5 Cream',
      slug: 'kem-duong-phuc-hoi-b5-cream',
      shortDescription: 'Phục hồi hàng rào bảo vệ da bị kích ứng, rát đỏ hoặc sau điều trị.',
      categoryName: 'Kem dưỡng',
      brandName: 'CalmSKIN Lab',
      price: 320000,
      originalPrice: 320000,
      discountPercent: 0,
      primaryImageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['B5', 'Làm Dịu', 'Phục Hồi'],
      averageRating: 4.9,
      totalReviews: 120,
      soldCount: 2310
    },
    {
      id: 3,
      name: 'Tinh chất Niacinamide 15% Dưỡng Sáng Mờ Thâm Sạm Brightening Booster',
      slug: 'tinh-chat-niacinamide-15-percent-brightening',
      shortDescription: 'Cải thiện sắc tố sạm đen, kiềm dầu thừa, se khít lỗ chân lông đáng kể.',
      categoryName: 'Serum',
      brandName: 'Luxe Derm',
      price: 450000,
      originalPrice: 500000,
      discountPercent: 10,
      primaryImageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['Niacinamide', 'Dưỡng Sáng', 'Mờ Thâm'],
      averageRating: 4.7,
      totalReviews: 45,
      soldCount: 540
    },
    {
      id: 4,
      name: 'Sữa Rửa Mặt Tạo Bọt Dịu Nhẹ Trà Xanh Hydrating Green Tea Cleanser',
      slug: 'sua-rua-mat-tao-bot-tra-xanh',
      shortDescription: 'Làm sạch sâu bụi mịn không gây khô căng da mặt, kháng viêm vượt trội.',
      categoryName: 'Sữa rửa mặt',
      brandName: 'CalmSKIN Lab',
      price: 185000,
      originalPrice: 220000,
      discountPercent: 16,
      primaryImageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400',
      isNewArrival: false,
      isFeatured: true,
      status: 'ACTIVE',
      tags: ['Trà Xanh', 'Làm Sạch', 'Dịu Nhẹ'],
      averageRating: 4.8,
      totalReviews: 215,
      soldCount: 3980
    }
  ];

  private readonly mockNewArrivals: ProductSummaryDTO[] = [
    {
      id: 5,
      name: 'Kem Chống Nắng Phổ Rộng Hàng Ngày Daily UV Shield Sunscreen SPF50+',
      slug: 'kem-chong-nang-pho-rong-shield-spf50',
      shortDescription: 'Kem chống nắng nâng tông nhẹ, mỏng mịn, kiềm dầu, chống ô nhiễm.',
      categoryName: 'Kem chống nắng',
      brandName: 'CalmSKIN Lab',
      price: 360000,
      primaryImageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
      isNewArrival: true,
      isFeatured: false,
      status: 'ACTIVE',
      tags: ['Chống Nắng', 'Quang Phổ Rộng'],
      averageRating: 5.0,
      totalReviews: 3,
      soldCount: 42
    },
    {
      id: 6,
      name: 'Tinh chất Tái Tạo Trẻ Hóa Da Đêm Retinol Liposome 0.5%',
      slug: 'retinol-liposome-0-5-percent',
      shortDescription: 'Kích thích tăng sinh collagen, làm mờ nếp nhăn li ti và cải thiện kết cấu da sần sùi.',
      categoryName: 'Serum',
      brandName: 'Luxe Derm',
      price: 520000,
      primaryImageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400',
      isNewArrival: true,
      isFeatured: false,
      status: 'ACTIVE',
      tags: ['Retinol', 'Trẻ Hóa', 'Chống Lão Hóa'],
      averageRating: 4.8,
      totalReviews: 6,
      soldCount: 88
    },
    {
      id: 7,
      name: 'Nước Hoa Hồng Cân Bằng Cấp Ẩm Centella Soothing Toner',
      slug: 'nuoc-hoa-hong-rau-ma-centella-toner',
      shortDescription: 'Cân bằng độ pH tức thì, chiết xuất rau má làm dịu các vùng mụn sưng đỏ.',
      categoryName: 'Toner',
      brandName: 'CalmSKIN Lab',
      price: 240000,
      primaryImageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400',
      isNewArrival: true,
      isFeatured: false,
      status: 'ACTIVE',
      tags: ['Rau Má', 'Toner', 'Làm Dịu'],
      averageRating: 4.9,
      totalReviews: 8,
      soldCount: 104
    },
    {
      id: 8,
      name: 'Mặt Nạ Giấy Đắp Cấp Ẩm Chuyên Sâu Hydrogel Hydration Mask',
      slug: 'mat-na-giay-cap-am-hydrogel',
      shortDescription: 'Mặt nạ lụa sinh học cấp nước sâu cho làn da ẩm mượt, căng bóng rạng rỡ ngay lập tức.',
      categoryName: 'Mặt nạ',
      brandName: 'Luxe Derm',
      price: 45000,
      primaryImageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=400',
      isNewArrival: true,
      isFeatured: false,
      status: 'ACTIVE',
      tags: ['Mặt Nạ', 'Cấp Nước', 'Căng Bóng'],
      averageRating: 4.7,
      totalReviews: 12,
      soldCount: 312
    }
  ];

  ngOnInit(): void {
    // Load Best Sellers
    this.productService.getBestSellers(0, 4).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content && res.data.content.length > 0) {
          this.bestSellers.set(res.data.content);
        } else {
          this.bestSellers.set(this.mockBestSellers);
        }
      },
      error: () => {
        this.bestSellers.set(this.mockBestSellers);
      }
    });

    // Load New Arrivals
    this.productService.getNewArrivals(0, 4).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content && res.data.content.length > 0) {
          this.newArrivals.set(res.data.content);
        } else {
          this.newArrivals.set(this.mockNewArrivals);
        }
      },
      error: () => {
        this.newArrivals.set(this.mockNewArrivals);
      }
    });
  }

  addToCart(product: ProductSummaryDTO) {
    this.cartService.addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      primaryImageUrl: product.primaryImageUrl,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      quantity: 1
    });
    
    alert(this.lang.currentLang() === 'vi' 
      ? `Đã thêm vào giỏ hàng: ${product.name}` 
      : `Added to cart successfully: ${product.name}`
    );
  }
}
