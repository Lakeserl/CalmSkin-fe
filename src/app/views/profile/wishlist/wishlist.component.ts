import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ProductService } from '../../../core/services/product.service';
import { LanguageService } from '../../../core/services/language.service';
import { ProductSummaryDTO } from '../../../core/models/product.model';

interface WishlistEntry {
  productId: string;
  product?: ProductSummaryDTO;  // hydrated lazily; may be null if lookup fails
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <div class="flex justify-between items-center border-b pb-4 mb-8">
        <h1 class="text-3xl font-serif text-brand-charcoal">
          {{ lang.currentLang() === 'vi' ? 'Sản phẩm yêu thích' : 'Wishlist' }}
        </h1>
        <a routerLink="/profile" class="text-xs text-brand-fuchsia hover:underline font-bold">
          ← {{ lang.currentLang() === 'vi' ? 'Về Tài khoản' : 'Back to Profile' }}
        </a>
      </div>

      @if (isLoading()) {
        <div class="text-center py-20 text-brand-muted text-sm">
          {{ lang.currentLang() === 'vi' ? 'Đang tải...' : 'Loading...' }}
        </div>
      } @else if (entries().length === 0) {
        <div class="text-center py-20 space-y-3">
          <div class="text-5xl">💝</div>
          <p class="text-brand-muted">
            {{ lang.currentLang() === 'vi'
              ? 'Bạn chưa có sản phẩm yêu thích nào.'
              : "You haven't saved any products yet." }}
          </p>
          <a routerLink="/products" class="inline-block mt-4 px-6 py-2.5 bg-brand-fuchsia text-white rounded-full font-bold text-xs">
            {{ lang.currentLang() === 'vi' ? 'Khám phá sản phẩm' : 'Browse products' }}
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (entry of entries(); track entry.productId) {
            <div class="bg-white rounded-skincare border border-brand-fuchsia-light/20 shadow-sm overflow-hidden">
              @if (entry.product) {
                <a [routerLink]="['/products', entry.product.slug]" class="block aspect-square bg-stone-100 overflow-hidden">
                  <img [src]="entry.product.primaryImageUrl || 'https://placehold.co/400'"
                       [alt]="entry.product.name"
                       class="w-full h-full object-cover hover:scale-105 transition-transform" />
                </a>
                <div class="p-4 space-y-2">
                  <a [routerLink]="['/products', entry.product.slug]"
                     class="font-semibold text-sm text-brand-charcoal line-clamp-2 hover:text-brand-fuchsia">
                    {{ entry.product.name }}
                  </a>
                  <p class="text-brand-fuchsia font-bold">
                    {{ entry.product.price | number:'1.0-0' }}đ
                  </p>
                </div>
              } @else {
                <div class="p-4 text-xs text-brand-muted">
                  Product {{ entry.productId.substring(0, 8) }}…
                  <p class="text-[10px] mt-1">
                    {{ lang.currentLang() === 'vi' ? 'Không thể tải thông tin' : 'Unable to load product info' }}
                  </p>
                </div>
              }
              <button (click)="remove(entry.productId)"
                      class="w-full py-2.5 border-t border-stone-100 text-red-500 text-[11px] font-bold hover:bg-red-50 transition">
                {{ lang.currentLang() === 'vi' ? 'Xóa khỏi yêu thích' : 'Remove from wishlist' }}
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class WishlistComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  readonly lang = inject(LanguageService);

  readonly entries = signal<WishlistEntry[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.userService.getWishlist().subscribe({
      next: res => {
        const ids = res.data ?? [];
        // Seed with bare IDs; UI shows skeletons. Product detail by UUID isn't
        // exposed publicly (only by slug), so we leave product info blank for
        // now — a future BE batch endpoint would hydrate these.
        this.entries.set(ids.map(id => ({ productId: id })));
        this.isLoading.set(false);
      },
      error: () => {
        this.entries.set([]);
        this.isLoading.set(false);
      }
    });
  }

  remove(productId: string): void {
    if (!confirm(this.lang.currentLang() === 'vi' ? 'Xóa khỏi danh sách yêu thích?' : 'Remove from wishlist?')) return;
    this.userService.removeFromWishlist(productId).subscribe({
      next: () => this.entries.update(list => list.filter(e => e.productId !== productId)),
      error: () => alert(this.lang.currentLang() === 'vi' ? 'Xóa không thành công' : 'Failed to remove')
    });
  }
}
