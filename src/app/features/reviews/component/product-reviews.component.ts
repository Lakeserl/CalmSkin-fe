import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewService } from '../../../core/services/review.service';
import { ReportReason, ReviewDTO } from '../../../core/models/review.model';
import { ReviewSummaryDTO } from '../../../core/models/product.model';

/**
 * Reusable product reviews panel: rating summary, paginated review list,
 * helpful-votes and report. Embed inside product detail.
 */
@Component({
  selector: 'app-product-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-6">
      <h2 class="text-xl sm:text-2xl font-serif text-brand-charcoal border-b pb-3">
        Đánh giá khách hàng
      </h2>

      <!-- Summary card -->
      @if (summary(); as s) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-skincare border">
          <div class="text-center md:border-r md:pr-6">
            <div class="text-4xl font-bold text-brand-fuchsia">
              {{ s.averageRating | number: '1.1-1' }}
            </div>
            <div class="flex justify-center mt-1 text-amber-400 text-sm">
              {{ stars(s.averageRating) }}
            </div>
            <p class="text-[11px] text-brand-muted mt-1">{{ s.totalReviews }} lượt đánh giá</p>
          </div>
          <div class="md:col-span-2 space-y-1.5">
            @for (row of distribution(); track row.star) {
              <button
                class="w-full flex items-center space-x-3 text-xs hover:bg-stone-50 px-1 py-0.5 rounded"
                (click)="filterByStar(row.star)"
              >
                <span class="w-8 text-brand-muted">{{ row.star }} ★</span>
                <div class="flex-1 h-2 bg-stone-200 rounded overflow-hidden">
                  <div
                    class="h-full bg-amber-400"
                    [style.width.%]="row.pct"
                  ></div>
                </div>
                <span class="w-10 text-right text-brand-muted">{{ row.count }}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Filter bar -->
      <div class="flex flex-wrap items-center gap-2 text-[11px]">
        <button
          class="px-3 py-1 rounded-full border"
          [class.bg-brand-fuchsia]="ratingFilter() === null"
          [class.text-white]="ratingFilter() === null"
          (click)="filterByStar(null)"
        >
          Tất cả
        </button>
        @for (r of [5, 4, 3, 2, 1]; track r) {
          <button
            class="px-3 py-1 rounded-full border"
            [class.bg-brand-fuchsia]="ratingFilter() === r"
            [class.text-white]="ratingFilter() === r"
            (click)="filterByStar(r)"
          >
            {{ r }} ★
          </button>
        }
        <span class="ml-2 text-brand-muted">Sắp xếp:</span>
        <select
          class="border rounded px-2 py-1 text-[11px]"
          [(ngModel)]="sortMode"
          (change)="resetAndLoad()"
        >
          <option value="newest">Mới nhất</option>
          <option value="helpful">Hữu ích nhất</option>
          <option value="rating-desc">Sao cao → thấp</option>
          <option value="rating-asc">Sao thấp → cao</option>
        </select>
      </div>

      <!-- Review list -->
      @if (isLoading() && reviews().length === 0) {
        <div class="py-10 text-center text-brand-muted text-sm">Đang tải đánh giá...</div>
      } @else if (reviews().length === 0) {
        <div class="py-10 text-center bg-white border rounded-skincare text-brand-muted text-sm">
          Chưa có đánh giá nào.
        </div>
      } @else {
        <div class="space-y-4">
          @for (rv of reviews(); track rv.id) {
            <article class="bg-white border rounded-skincare p-4 space-y-2">
              <header class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-amber-400 text-sm">{{ stars(rv.rating) }}</span>
                  @if (rv.verified) {
                    <span class="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      ĐÃ MUA
                    </span>
                  }
                  @if (rv.skinType) {
                    <span class="text-[9px] bg-stone-100 text-brand-muted px-2 py-0.5 rounded-full">
                      {{ rv.skinType }}
                    </span>
                  }
                </div>
                <time class="text-[10px] text-brand-muted">{{ rv.createdAt | date: 'dd/MM/yyyy' }}</time>
              </header>
              @if (rv.title) {
                <h3 class="font-semibold text-brand-charcoal text-sm">{{ rv.title }}</h3>
              }
              @if (rv.body) {
                <p class="text-xs text-brand-charcoal/80 whitespace-pre-line">{{ rv.body }}</p>
              }
              @if (rv.media?.length) {
                <div class="flex gap-2 flex-wrap pt-1">
                  @for (m of rv.media!; track m.id) {
                    @if (m.mediaType === 'IMAGE') {
                      <img [src]="m.thumbnailUrl || m.url" class="w-16 h-16 object-cover rounded border" />
                    }
                  }
                </div>
              }
              <footer class="flex items-center space-x-3 pt-2 text-[11px] text-brand-muted">
                <button
                  class="flex items-center space-x-1 hover:text-brand-fuchsia disabled:opacity-50"
                  [disabled]="voting() === rv.id"
                  (click)="onVote(rv, true)"
                >
                  <span>👍</span>
                  <span>Hữu ích ({{ rv.helpfulCount }})</span>
                </button>
                <button
                  class="flex items-center space-x-1 hover:text-brand-fuchsia disabled:opacity-50"
                  [disabled]="voting() === rv.id"
                  (click)="onVote(rv, false)"
                >
                  <span>👎</span>
                  <span>({{ rv.notHelpfulCount }})</span>
                </button>
                <button class="hover:text-brand-fuchsia" (click)="toggleReplies(rv)">
                  Trả lời ({{ rv.replies?.length ?? 0 }})
                </button>
                <button class="hover:text-rose-500 ml-auto" (click)="onReport(rv)">Báo cáo</button>
              </footer>

              @if (openReplies() === rv.id) {
                <div class="pt-3 mt-2 border-t space-y-2">
                  @for (rp of rv.replies ?? []; track rp.id) {
                    <div class="text-xs bg-stone-50 rounded p-2">
                      <div class="flex items-center space-x-2">
                        @if (rp.seller) {
                          <span class="text-[9px] bg-brand-fuchsia text-white px-1.5 py-0.5 rounded-full font-bold">
                            CALMSKIN
                          </span>
                        }
                        <time class="text-[10px] text-brand-muted">
                          {{ rp.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                        </time>
                      </div>
                      <p class="text-xs mt-1 whitespace-pre-line">{{ rp.body }}</p>
                    </div>
                  }
                  <div class="flex space-x-2">
                    <input
                      class="flex-1 border rounded px-2 py-1 text-xs"
                      placeholder="Viết phản hồi..."
                      [(ngModel)]="replyDraft"
                    />
                    <button
                      class="px-3 py-1 bg-brand-fuchsia text-white rounded text-xs font-semibold disabled:opacity-50"
                      [disabled]="postingReply()"
                      (click)="postReply(rv)"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              }
            </article>
          }
        </div>

        @if (hasMore()) {
          <div class="text-center pt-2">
            <button
              class="px-5 py-2 border rounded-full text-xs font-semibold hover:bg-stone-50 disabled:opacity-50"
              [disabled]="isLoading()"
              (click)="loadMore()"
            >
              {{ isLoading() ? 'Đang tải...' : 'Xem thêm' }}
            </button>
          </div>
        }
      }
    </section>
  `,
})
export class ProductReviewsComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly destroyRef = inject(DestroyRef);

  readonly productId = input.required<number>();
  /** Preloaded summary from product-service ProductDTO.reviewSummary. Avoids an N+1 review-service call. */
  readonly summary = input<ReviewSummaryDTO | null>(null);

  readonly reviews = signal<ReviewDTO[]>([]);
  readonly isLoading = signal(false);
  readonly hasMore = signal(false);
  readonly voting = signal<number | null>(null);
  readonly ratingFilter = signal<number | null>(null);
  readonly openReplies = signal<number | null>(null);
  readonly postingReply = signal(false);

  sortMode: 'newest' | 'helpful' | 'rating-desc' | 'rating-asc' = 'newest';
  replyDraft = '';

  private page = 0;
  private readonly size = 5;

  readonly distribution = computed(() => {
    const s = this.summary();
    const total = s?.totalReviews ?? 0;
    if (!s || total === 0) {
      return [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, pct: 0 }));
    }
    const counts: Record<number, number> = {
      5: s.fiveStarCount ?? 0,
      4: s.fourStarCount ?? 0,
      3: s.threeStarCount ?? 0,
      2: s.twoStarCount ?? 0,
      1: s.oneStarCount ?? 0,
    };
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      pct: Math.round((counts[star] / total) * 100),
    }));
  });

  constructor() {
    // (re)load whenever the productId input changes. Summary comes from the
    // parent's preloaded ProductDTO.reviewSummary — no extra fetch.
    effect(() => {
      const id = this.productId();
      if (!id) return;
      this.resetAndLoad();
    });
  }

  stars(rating: number): string {
    const full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  filterByStar(star: number | null): void {
    if (this.ratingFilter() === star) return;
    this.ratingFilter.set(star);
    this.resetAndLoad();
  }

  resetAndLoad(): void {
    this.page = 0;
    this.reviews.set([]);
    this.fetch(false);
  }

  loadMore(): void {
    this.page += 1;
    this.fetch(true);
  }

  private fetch(append: boolean): void {
    const productId = this.productId();
    if (!productId) return;
    const { sort, dir } = this.sortParams();
    this.isLoading.set(true);
    this.reviewService
      .getProductReviews(productId, {
        rating: this.ratingFilter() ?? undefined,
        page: this.page,
        size: this.size,
        sort,
        dir,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          const list = res.data?.content ?? [];
          this.reviews.set(append ? [...this.reviews(), ...list] : list);
          this.hasMore.set(!(res.data?.last ?? true));
        },
        error: () => {
          this.isLoading.set(false);
          this.hasMore.set(false);
        },
      });
  }

  private sortParams(): { sort: string; dir: 'asc' | 'desc' } {
    switch (this.sortMode) {
      case 'helpful':
        return { sort: 'helpfulCount', dir: 'desc' };
      case 'rating-desc':
        return { sort: 'rating', dir: 'desc' };
      case 'rating-asc':
        return { sort: 'rating', dir: 'asc' };
      default:
        return { sort: 'createdAt', dir: 'desc' };
    }
  }

  onVote(rv: ReviewDTO, helpful: boolean): void {
    this.voting.set(rv.id);
    this.reviewService
      .vote(rv.id, helpful)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.voting.set(null);
          // Optimistic increment; the server is source of truth on next reload.
          this.reviews.update((list) =>
            list.map((r) =>
              r.id === rv.id
                ? {
                    ...r,
                    helpfulCount: helpful ? r.helpfulCount + 1 : r.helpfulCount,
                    notHelpfulCount: helpful ? r.notHelpfulCount : r.notHelpfulCount + 1,
                    currentUserVote: helpful,
                  }
                : r,
            ),
          );
        },
        error: (err) => {
          this.voting.set(null);
          alert(err?.message || 'Không thể ghi nhận đánh giá. Bạn cần đăng nhập.');
        },
      });
  }

  toggleReplies(rv: ReviewDTO): void {
    if (this.openReplies() === rv.id) {
      this.openReplies.set(null);
      return;
    }
    this.openReplies.set(rv.id);
    this.replyDraft = '';
    // Lazy-load replies on first open in case BE didn't inline them.
    if (!rv.replies) {
      this.reviewService
        .getReplies(rv.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.reviews.update((list) =>
              list.map((r) => (r.id === rv.id ? { ...r, replies: res.data ?? [] } : r)),
            );
          },
          error: () => {},
        });
    }
  }

  postReply(rv: ReviewDTO): void {
    const body = this.replyDraft.trim();
    if (!body) return;
    this.postingReply.set(true);
    this.reviewService
      .createReply(rv.id, { body })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.postingReply.set(false);
          if (!res.data) return;
          const reply = res.data;
          this.reviews.update((list) =>
            list.map((r) =>
              r.id === rv.id ? { ...r, replies: [...(r.replies ?? []), reply] } : r,
            ),
          );
          this.replyDraft = '';
        },
        error: (err) => {
          this.postingReply.set(false);
          alert(err?.message || 'Không thể gửi phản hồi. Bạn cần đăng nhập.');
        },
      });
  }

  onReport(rv: ReviewDTO): void {
    const reason = prompt(
      'Lý do báo cáo (SPAM / FAKE / OFFENSIVE / OFF_TOPIC / OTHER):',
      'SPAM',
    );
    if (!reason) return;
    const normalized = reason.trim().toUpperCase() as ReportReason;
    const valid: ReportReason[] = ['SPAM', 'FAKE', 'OFFENSIVE', 'OFF_TOPIC', 'OTHER'];
    if (!valid.includes(normalized)) {
      alert('Lý do không hợp lệ.');
      return;
    }
    const detail = prompt('Chi tiết (tuỳ chọn):') ?? undefined;
    this.reviewService
      .reportReview(rv.id, { reason: normalized, detail })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => alert('Đã gửi báo cáo, cảm ơn bạn.'),
        error: (err) => alert(err?.message || 'Gửi báo cáo thất bại.'),
      });
  }
}
