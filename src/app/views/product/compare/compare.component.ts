import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductDTO } from '../../../core/models/product.model';

/**
 * Side-by-side compare 2-4 products. URL drives state: /products/compare?ids=1,2,3
 */
@Component({
  selector: 'app-product-compare',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header class="border-b pb-5">
        <h1 class="text-3xl font-serif text-brand-charcoal">So sánh sản phẩm</h1>
        <p class="text-xs text-brand-muted mt-1">So sánh tối đa 4 sản phẩm cùng lúc theo các thuộc tính chính.</p>
      </header>

      @if (isLoading()) {
        <div class="py-20 text-center text-brand-muted text-sm">Đang tải dữ liệu so sánh...</div>
      } @else if (errorMessage()) {
        <div class="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-6 text-center space-y-3">
          <p>{{ errorMessage() }}</p>
          <a routerLink="/products" class="inline-block text-brand-fuchsia underline">Quay lại danh sách sản phẩm</a>
        </div>
      } @else if (products().length < 2) {
        <div class="text-center py-20 bg-stone-50 border rounded-skincare space-y-3">
          <p class="text-sm text-brand-muted">Cần ít nhất 2 sản phẩm để so sánh.</p>
          <a routerLink="/products" class="inline-block px-5 py-2 bg-brand-fuchsia text-white text-xs font-bold rounded-full">Chọn sản phẩm</a>
        </div>
      } @else {
        <div class="overflow-x-auto bg-white border rounded-skincare">
          <table class="min-w-full text-xs">
            <thead>
              <tr class="border-b bg-stone-50">
                <th class="p-4 text-left text-brand-muted uppercase font-semibold w-36 sticky left-0 bg-stone-50">Thuộc tính</th>
                @for (p of products(); track p.id) {
                  <th class="p-4 text-center min-w-[200px] align-top">
                    <div class="space-y-2">
                      <a [routerLink]="['/products', p.slug]" class="block">
                        <img [src]="p.images[0]?.imageUrl || 'assets/placeholder.jpg'" class="w-28 h-28 mx-auto object-cover rounded-xl border" />
                      </a>
                      <a [routerLink]="['/products', p.slug]" class="block font-semibold text-brand-charcoal hover:text-brand-fuchsia line-clamp-2 text-xs">
                        {{ p.name }}
                      </a>
                      <button
                        class="text-[10px] text-rose-500 hover:underline"
                        (click)="removeProduct(p.id)"
                      >Bỏ khỏi so sánh</button>
                    </div>
                  </th>
                }
              </tr>
            </thead>
            <tbody class="text-brand-charcoal">
              @for (row of rows(); track row.label) {
                <tr class="border-b">
                  <td class="p-4 font-semibold text-brand-muted sticky left-0 bg-white">{{ row.label }}</td>
                  @for (val of row.values; track $index) {
                    @if (row.html) {
                      <td class="p-4 text-center" [innerHTML]="val"></td>
                    } @else {
                      <td class="p-4 text-center">{{ val }}</td>
                    }
                  }
                </tr>
              }
              <tr>
                <td class="p-4 sticky left-0 bg-white"></td>
                @for (p of products(); track p.id) {
                  <td class="p-4 text-center">
                    <button
                      class="px-4 py-2 bg-brand-fuchsia text-white text-xs font-bold rounded-full hover:bg-brand-fuchsia-dark"
                      (click)="addToCart(p)"
                    >Thêm vào giỏ</button>
                  </td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class CompareComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<ProductDTO[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly rows = computed<{ label: string; values: string[]; html?: boolean }[]>(() => {
    const list = this.products();
    if (list.length === 0) return [];
    return [
      { label: 'Thương hiệu', values: list.map((p) => p.brand?.name ?? '—') },
      { label: 'Danh mục', values: list.map((p) => p.category?.name ?? '—') },
      {
        label: 'Giá',
        html: true,
        values: list.map(
          (p) =>
            `<span class="font-bold text-brand-fuchsia-dark">${this.formatVnd(p.salePrice ?? p.basePrice)}</span>` +
            (p.salePrice && p.basePrice > p.salePrice
              ? `<br/><span class="text-[10px] text-brand-muted line-through">${this.formatVnd(p.basePrice)}</span>`
              : ''),
        ),
      },
      {
        label: 'Đánh giá',
        html: true,
        values: list.map((p) => {
          const avg = p.reviewSummary?.averageRating;
          const total = p.reviewSummary?.totalReviews ?? 0;
          return avg != null && total > 0
            ? `<span class="text-amber-500 font-bold">${avg.toFixed(1)} ★</span> <span class="text-brand-muted">(${total})</span>`
            : '<span class="text-brand-muted">Chưa có</span>';
        }),
      },
      { label: 'Đã bán', values: list.map((p) => String(p.soldCount ?? 0)) },
      {
        label: 'Loại da phù hợp',
        values: list.map((p) => (p.suitableSkinTypes?.length ? p.suitableSkinTypes.join(', ') : '—')),
      },
      {
        label: 'Vấn đề da',
        values: list.map((p) => (p.skinConcerns?.length ? p.skinConcerns.join(', ') : '—')),
      },
      {
        label: 'Dung tích',
        values: list.map((p) => (p.volumeMl ? `${p.volumeMl}ml` : '—')),
      },
      {
        label: 'Thành phần chính',
        values: list.map((p) =>
          p.keyIngredients?.length
            ? p.keyIngredients.filter((i) => i.isKeyIngredient).slice(0, 4).map((i) => i.name).join(', ') || '—'
            : '—',
        ),
      },
      {
        label: 'Mô tả',
        values: list.map((p) => p.shortDescription || '—'),
      },
    ];
  });

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const raw = params['ids'] ?? '';
      const ids = String(raw)
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);
      this.load(ids);
    });
  }

  private load(ids: number[]): void {
    if (ids.length < 2) {
      this.products.set([]);
      this.errorMessage.set('');
      return;
    }
    if (ids.length > 4) {
      this.errorMessage.set('Chỉ so sánh được tối đa 4 sản phẩm cùng lúc.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.productService
      .compareProducts(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.products.set(res.data ?? []);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.products.set([]);
          this.errorMessage.set(err?.message || 'Không thể tải dữ liệu so sánh.');
        },
      });
  }

  removeProduct(id: number): void {
    const remaining = this.products()
      .filter((p) => p.id !== id)
      .map((p) => p.id);
    this.router.navigate(['/products/compare'], { queryParams: { ids: remaining.join(',') } });
  }

  addToCart(p: ProductDTO): void {
    this.cart.addToCart({
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      primaryImageUrl: p.images[0]?.imageUrl,
      quantity: 1,
      price: p.salePrice ?? p.basePrice,
      originalPrice: p.basePrice,
    });
  }

  private formatVnd(n: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  }
}
