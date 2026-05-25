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
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoutineService } from '../../core/services/routine.service';
import { CartService } from '../../core/services/cart.service';
import {
  GenerateRoutineRequest,
  RoutineResponse,
  RoutineSteps,
} from '../../core/models/routine.model';
import { ProductSummaryDTO } from '../../core/models/product.model';

interface DisplayStep {
  key: keyof RoutineSteps;
  label: string;
  hint: string;
}

@Component({
  selector: 'app-routine',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <header class="border-b pb-5">
        <h1 class="text-3xl font-serif text-brand-charcoal">Liệu trình của bạn</h1>
        <p class="text-xs text-brand-muted mt-1">
          Gợi ý liệu trình sáng – tối được cá nhân hoá theo hồ sơ da. Chọn ưu tiên rồi nhấn "Tạo liệu trình".
        </p>
      </header>

      <!-- Inputs -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Loại da</label>
          <select [(ngModel)]="skinType" class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-fuchsia">
            <option value="">Theo hồ sơ da của tôi</option>
            <option value="OILY">Da dầu</option>
            <option value="DRY">Da khô</option>
            <option value="COMBINATION">Da hỗn hợp</option>
            <option value="SENSITIVE">Da nhạy cảm</option>
            <option value="NORMAL">Da thường</option>
          </select>
        </div>
        <div class="space-y-1.5 md:col-span-1">
          <label class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Vấn đề (chọn nhiều)</label>
          <div class="flex flex-wrap gap-1.5">
            @for (c of availableConcerns; track c.value) {
              <button
                type="button"
                class="px-2.5 py-1 text-[11px] rounded-full border transition-all"
                [class.bg-brand-fuchsia]="concerns().includes(c.value)"
                [class.text-white]="concerns().includes(c.value)"
                [class.border-brand-fuchsia]="concerns().includes(c.value)"
                (click)="toggleConcern(c.value)"
              >
                {{ c.label }}
              </button>
            }
          </div>
        </div>
        <div>
          <button
            type="button"
            class="w-full md:w-auto px-6 py-2.5 bg-brand-fuchsia text-white text-xs font-bold rounded-full hover:bg-brand-fuchsia-dark disabled:opacity-50"
            [disabled]="isLoading()"
            (click)="generate()"
          >
            {{ isLoading() ? 'Đang tạo...' : 'Tạo liệu trình' }}
          </button>
        </div>
      </section>

      @if (errorMessage()) {
        <div class="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-4 text-center">
          {{ errorMessage() }}
        </div>
      }

      <!-- Result -->
      @if (routine(); as r) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section class="bg-amber-50/50 border border-amber-200 rounded-skincare p-5 space-y-4">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">🌅</span>
              <h2 class="text-xl font-serif text-brand-charcoal">Liệu trình buổi sáng</h2>
            </div>
            @for (step of stepDefs; track step.key) {
              <article class="space-y-2">
                <header>
                  <p class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">{{ step.label }}</p>
                  <p class="text-[10px] text-brand-muted">{{ step.hint }}</p>
                </header>
                @if (r.morning[step.key].length === 0) {
                  <p class="text-[11px] text-brand-muted italic">Bỏ qua bước này nếu chưa có sản phẩm phù hợp.</p>
                } @else {
                  <ul class="space-y-2">
                    @for (p of r.morning[step.key]; track p.id) {
                      <li class="flex items-center space-x-3 bg-white p-2 rounded-xl border">
                        <a [routerLink]="['/products', p.slug]" class="shrink-0">
                          <img [src]="p.primaryImageUrl || 'assets/placeholder.jpg'" class="w-12 h-12 object-cover rounded-lg" />
                        </a>
                        <div class="flex-1 min-w-0">
                          <a [routerLink]="['/products', p.slug]" class="text-xs font-semibold text-brand-charcoal hover:text-brand-fuchsia line-clamp-2">
                            {{ p.name }}
                          </a>
                          <p class="text-[11px] font-bold text-brand-fuchsia-dark">{{ p.price | currency: 'VND' : 'symbol' : '1.0-0' }}</p>
                        </div>
                        <button
                          class="shrink-0 px-2 py-1 text-[10px] font-bold bg-brand-rosewater text-brand-fuchsia rounded-full hover:bg-brand-fuchsia hover:text-white"
                          (click)="addToCart(p)"
                        >Thêm</button>
                      </li>
                    }
                  </ul>
                }
              </article>
            }
          </section>

          <section class="bg-indigo-50/40 border border-indigo-200 rounded-skincare p-5 space-y-4">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">🌙</span>
              <h2 class="text-xl font-serif text-brand-charcoal">Liệu trình buổi tối</h2>
            </div>
            @for (step of stepDefs; track step.key) {
              <article class="space-y-2">
                <header>
                  <p class="text-xs font-semibold text-brand-charcoal uppercase tracking-wider">{{ step.label }}</p>
                  <p class="text-[10px] text-brand-muted">{{ step.hint }}</p>
                </header>
                @if (r.evening[step.key].length === 0) {
                  <p class="text-[11px] text-brand-muted italic">Bỏ qua bước này nếu chưa có sản phẩm phù hợp.</p>
                } @else {
                  <ul class="space-y-2">
                    @for (p of r.evening[step.key]; track p.id) {
                      <li class="flex items-center space-x-3 bg-white p-2 rounded-xl border">
                        <a [routerLink]="['/products', p.slug]" class="shrink-0">
                          <img [src]="p.primaryImageUrl || 'assets/placeholder.jpg'" class="w-12 h-12 object-cover rounded-lg" />
                        </a>
                        <div class="flex-1 min-w-0">
                          <a [routerLink]="['/products', p.slug]" class="text-xs font-semibold text-brand-charcoal hover:text-brand-fuchsia line-clamp-2">
                            {{ p.name }}
                          </a>
                          <p class="text-[11px] font-bold text-brand-fuchsia-dark">{{ p.price | currency: 'VND' : 'symbol' : '1.0-0' }}</p>
                        </div>
                        <button
                          class="shrink-0 px-2 py-1 text-[10px] font-bold bg-brand-rosewater text-brand-fuchsia rounded-full hover:bg-brand-fuchsia hover:text-white"
                          (click)="addToCart(p)"
                        >Thêm</button>
                      </li>
                    }
                  </ul>
                }
              </article>
            }
          </section>
        </div>

        <div class="text-center pt-4">
          <button
            class="px-6 py-2.5 bg-brand-charcoal text-white text-xs font-bold rounded-full hover:bg-brand-fuchsia"
            (click)="addAllToCart()"
          >
            Thêm tất cả ({{ totalProducts() }} sản phẩm) vào giỏ
          </button>
        </div>
      } @else if (!isLoading() && !errorMessage()) {
        <div class="text-center py-20 bg-stone-50 border rounded-skincare">
          <p class="text-sm text-brand-muted">Nhấn "Tạo liệu trình" để xem gợi ý cá nhân hoá cho bạn.</p>
        </div>
      }
    </div>
  `,
})
export class RoutineComponent implements OnInit {
  private readonly routineService = inject(RoutineService);
  private readonly cart = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly routine = signal<RoutineResponse | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly concerns = signal<string[]>([]);

  skinType = '';

  readonly availableConcerns: { label: string; value: string }[] = [
    { label: 'Mụn', value: 'ACNE' },
    { label: 'Thâm', value: 'DARK_SPOTS' },
    { label: 'Lão hoá', value: 'AGING' },
    { label: 'Khô', value: 'DRYNESS' },
    { label: 'Nhạy cảm', value: 'SENSITIVITY' },
    { label: 'Lỗ chân lông', value: 'PORES' },
  ];

  readonly stepDefs: DisplayStep[] = [
    { key: 'cleanse', label: 'Bước 1 — Làm sạch', hint: 'Sữa rửa mặt loại bỏ bụi bẩn và dầu thừa.' },
    { key: 'treat', label: 'Bước 2 — Điều trị', hint: 'Tinh chất chuyên biệt cho vấn đề da.' },
    { key: 'moisturize', label: 'Bước 3 — Dưỡng ẩm', hint: 'Kem dưỡng phục hồi hàng rào bảo vệ.' },
    { key: 'protect', label: 'Bước 4 — Bảo vệ / Khoá ẩm', hint: 'Kem chống nắng (sáng) hoặc kem đêm (tối).' },
  ];

  readonly totalProducts = computed(() => {
    const r = this.routine();
    if (!r) return 0;
    return (
      this.countSteps(r.morning) + this.countSteps(r.evening)
    );
  });

  ngOnInit(): void {
    this.generate();
  }

  toggleConcern(c: string): void {
    const list = this.concerns();
    this.concerns.set(list.includes(c) ? list.filter((x) => x !== c) : [...list, c]);
  }

  generate(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const body: GenerateRoutineRequest = {
      skinType: this.skinType || undefined,
      skinConcerns: this.concerns().length ? this.concerns() : undefined,
    };
    this.routineService
      .generate(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.routine.set(res.data ?? null);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.routine.set(null);
          this.errorMessage.set(err?.message || 'Không thể tạo liệu trình. Vui lòng cập nhật hồ sơ da và thử lại.');
        },
      });
  }

  addToCart(p: ProductSummaryDTO): void {
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

  addAllToCart(): void {
    const r = this.routine();
    if (!r) return;
    const all = [...this.flatten(r.morning), ...this.flatten(r.evening)];
    // De-dup by productId so duplicates between morning/evening don't get added twice.
    const seen = new Set<number>();
    for (const p of all) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      this.addToCart(p);
    }
  }

  private flatten(s: RoutineSteps): ProductSummaryDTO[] {
    return [...s.cleanse, ...s.treat, ...s.moisturize, ...s.protect];
  }

  private countSteps(s: RoutineSteps): number {
    return s.cleanse.length + s.treat.length + s.moisturize.length + s.protect.length;
  }
}
