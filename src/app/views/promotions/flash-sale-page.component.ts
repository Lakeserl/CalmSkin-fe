import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PromotionService } from '../../core/services/promotion.service';
import { LanguageService } from '../../core/services/language.service';
import { FlashSaleDTO } from '../../core/models/promotion.model';

@Component({
  selector: 'app-flash-sale-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal">
          {{ lang.currentLang() === 'vi' ? '⚡ Khuyến Mãi Chớp Nhoáng' : '⚡ Flash Sales' }}
        </h1>
        <p class="text-sm text-brand-muted mt-2">
          {{ lang.currentLang() === 'vi'
            ? 'Giảm giá có thời hạn — số lượng giới hạn!'
            : 'Time-limited offers — limited stock!' }}
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center border-b border-brand-fuchsia-light/20 mb-8">
        <button
          (click)="activeTab.set('current')"
          [class.border-brand-fuchsia]="activeTab() === 'current'"
          [class.text-brand-fuchsia-dark]="activeTab() === 'current'"
          class="px-6 py-3 text-sm font-semibold border-b-2 border-transparent text-brand-muted transition-all focus:outline-none"
        >
          {{ lang.currentLang() === 'vi' ? 'Đang diễn ra' : 'Live now' }}
        </button>
        <button
          (click)="activeTab.set('upcoming')"
          [class.border-brand-fuchsia]="activeTab() === 'upcoming'"
          [class.text-brand-fuchsia-dark]="activeTab() === 'upcoming'"
          class="px-6 py-3 text-sm font-semibold border-b-2 border-transparent text-brand-muted transition-all focus:outline-none"
        >
          {{ lang.currentLang() === 'vi' ? 'Sắp diễn ra' : 'Upcoming' }}
        </button>
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white rounded-skincare h-72 animate-pulse border border-stone-100"></div>
          }
        </div>
      } @else if (sales().length === 0) {
        <div class="text-center py-16 text-brand-muted">
          <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <p class="text-sm">
            {{ lang.currentLang() === 'vi'
              ? (activeTab() === 'current' ? 'Hiện không có flash-sale đang diễn ra.' : 'Chưa có flash-sale sắp tới.')
              : (activeTab() === 'current' ? 'No flash sales running right now.' : 'No upcoming flash sales scheduled.') }}
          </p>
        </div>
      } @else {
        <div class="space-y-10">
          @for (sale of sales(); track sale.promotionId) {
            <section class="bg-white rounded-skincare border border-brand-fuchsia-light/20 shadow-sm p-6">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <div>
                  <h2 class="text-lg font-serif font-bold text-brand-charcoal">{{ sale.promotionName }}</h2>
                  <p class="text-[11px] text-brand-muted mt-0.5">
                    {{ lang.currentLang() === 'vi' ? 'Kết thúc' : 'Ends' }}:
                    <span class="font-bold text-brand-fuchsia-dark">{{ sale.endsAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </p>
                </div>
                <span class="bg-brand-fuchsia text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {{ sale.products.length }} {{ lang.currentLang() === 'vi' ? 'sản phẩm' : 'items' }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                @for (p of sale.products; track p.productId + '-' + (p.variantId || 0)) {
                  <div class="border border-stone-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                    <div class="aspect-square bg-stone-50 rounded-lg mb-2 flex items-center justify-center text-stone-300">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                    <p class="text-[11px] text-brand-muted">
                      {{ lang.currentLang() === 'vi' ? 'Mã SP' : 'Product' }} #{{ p.productId }}
                    </p>
                    <div class="flex items-baseline space-x-1.5 mt-1">
                      <span class="font-extrabold text-brand-fuchsia-dark text-sm">
                        {{ p.salePrice | currency:'VND':'symbol':'1.0-0' }}
                      </span>
                      <span class="line-through text-[10px] text-stone-400">
                        {{ p.originalPrice | currency:'VND':'symbol':'1.0-0' }}
                      </span>
                    </div>
                    <p class="text-[10px] text-brand-muted mt-1">
                      {{ lang.currentLang() === 'vi' ? 'Còn lại' : 'Left' }}:
                      <span class="font-bold" [class.text-red-500]="p.quantityLeft < 10">{{ p.quantityLeft }}</span>
                    </p>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>
  `,
})
export class FlashSalePageComponent implements OnInit {
  private readonly promotionService = inject(PromotionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);

  readonly current = signal<FlashSaleDTO[]>([]);
  readonly upcoming = signal<FlashSaleDTO[]>([]);
  readonly activeTab = signal<'current' | 'upcoming'>('current');
  readonly isLoading = signal(false);

  readonly sales = computed(() =>
    this.activeTab() === 'current' ? this.current() : this.upcoming(),
  );

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll() {
    this.isLoading.set(true);
    this.promotionService.getCurrentFlashSales()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.current.set(res.data ?? []),
        error: () => this.current.set([]),
      });
    this.promotionService.getUpcomingFlashSales()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.upcoming.set(res.data ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.upcoming.set([]);
          this.isLoading.set(false);
        },
      });
  }
}
