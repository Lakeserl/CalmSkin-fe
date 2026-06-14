import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductSummaryDTO } from '../../core/models/product.model';

/**
 * Horizontal product row used for "Dành cho bạn", "Đang xu hướng",
 * "Đã xem gần đây", "Tương tự", "Mua kèm". Pass title + products.
 */
@Component({
  selector: 'app-product-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    @if (products().length > 0) {
      <section class="space-y-4">
        <header class="flex items-center justify-between border-b border-brand-fuchsia-light/20 pb-2">
          <h2 class="text-lg sm:text-xl font-serif text-brand-charcoal flex items-center space-x-2">
            @if (icon()) { <span>{{ icon() }}</span> }
            <span>{{ title() }}</span>
          </h2>
          @if (subtitle()) {
            <p class="text-[10px] text-brand-muted">{{ subtitle() }}</p>
          }
        </header>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          @for (p of products(); track p.id) {
            <article class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm hover:shadow-md hover:border-brand-fuchsia/40 transition-all duration-300 group">
              <a [routerLink]="['/products', p.slug]" class="block overflow-hidden rounded-t-skincare aspect-square bg-brand-champagne">
                <img
                  [src]="p.primaryImageUrl || 'assets/placeholder.jpg'"
                  [alt]="p.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </a>
              <div class="p-3 space-y-1.5">
                <p class="text-[9px] text-brand-muted uppercase font-semibold tracking-wider truncate">{{ p.brandName }}</p>
                <a [routerLink]="['/products', p.slug]">
                  <h3 class="font-semibold text-brand-charcoal text-xs line-clamp-2 hover:text-brand-fuchsia transition-colors min-h-[2rem]">{{ p.name }}</h3>
                </a>
                @if ((p.averageRating ?? 0) > 0) {
                  <div class="flex items-center space-x-1 text-[10px]">
                    <span class="text-amber-500 font-bold">{{ p.averageRating | number: '1.1-1' }} ★</span>
                    <span class="text-brand-muted">({{ p.totalReviews ?? 0 }})</span>
                  </div>
                }
                <div class="flex items-center justify-between pt-1.5 border-t border-stone-50 mt-2">
                  <div class="flex flex-col">
                    <span class="text-xs sm:text-sm font-bold text-brand-fuchsia-dark">{{ p.price | currency: 'VND' : 'symbol' : '1.0-0' }}</span>
                    @if (p.originalPrice && p.originalPrice > p.price) {
                      <span class="text-[9px] text-brand-muted line-through">{{ p.originalPrice | currency: 'VND' : 'symbol' : '1.0-0' }}</span>
                    }
                  </div>
                  <button
                    type="button"
                    class="p-1.5 bg-brand-rosewater text-brand-fuchsia hover:bg-brand-fuchsia hover:text-white rounded-full transition-all"
                    title="Thêm vào giỏ"
                    (click)="add(p)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class ProductRowComponent {
  private readonly cart = inject(CartService);

  readonly title = input.required<string>();
  readonly products = input.required<ProductSummaryDTO[]>();
  readonly icon = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);

  add(p: ProductSummaryDTO): void {
    this.cart.addToCart({
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      primaryImageUrl: p.primaryImageUrl,
      quantity: 1,
      price: p.price,
      originalPrice: p.originalPrice ?? p.price,
    });
  }
}
