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
import { ReviewService } from '../../../core/services/review.service';
import {
  CreateReviewRequest,
  EligibilityDTO,
  ReviewDTO,
  SkinTypeTag,
  UpdateReviewRequest,
} from '../../../core/models/review.model';

type Tab = 'eligible' | 'mine';

interface DraftReview {
  productId: number;
  orderItemId: number;
  rating: number;
  title: string;
  body: string;
  skinType: SkinTypeTag | '';
  mediaUrls: string[];
}

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <header class="border-b pb-4">
        <h1 class="text-2xl font-serif text-brand-charcoal">Đánh giá của tôi</h1>
        <p class="text-xs text-brand-muted mt-1">
          Đánh giá sản phẩm bạn đã mua và xem các nhận xét đã đăng.
        </p>
      </header>

      <!-- Tabs -->
      <div class="flex space-x-1 text-xs font-semibold">
        <button
          class="px-4 py-2 rounded-full border"
          [class.bg-brand-fuchsia]="tab() === 'eligible'"
          [class.text-white]="tab() === 'eligible'"
          (click)="tab.set('eligible')"
        >
          Chưa đánh giá ({{ pendingEligibleCount() }})
        </button>
        <button
          class="px-4 py-2 rounded-full border"
          [class.bg-brand-fuchsia]="tab() === 'mine'"
          [class.text-white]="tab() === 'mine'"
          (click)="tab.set('mine'); loadMine()"
        >
          Đã đánh giá
        </button>
      </div>

      <!-- Eligible items -->
      @if (tab() === 'eligible') {
        @if (loadingEligible()) {
          <div class="py-10 text-center text-brand-muted text-sm">Đang tải...</div>
        } @else if (eligible().length === 0) {
          <div class="py-10 text-center bg-white border rounded-skincare text-brand-muted text-sm">
            Không có sản phẩm nào cần đánh giá.
          </div>
        } @else {
          <div class="space-y-3">
            @for (item of eligible(); track item.orderItemId) {
              <div class="bg-white border rounded-skincare p-4 flex items-center justify-between">
                <div>
                  <a
                    [routerLink]="['/products']"
                    [queryParams]="{ id: item.productId }"
                    class="text-sm font-semibold text-brand-charcoal hover:text-brand-fuchsia"
                  >
                    Sản phẩm #{{ item.productId }}
                  </a>
                  <p class="text-[11px] text-brand-muted">
                    Đặt xong: {{ item.orderCompletedAt | date: 'dd/MM/yyyy' }}
                  </p>
                </div>
                @if (item.reviewed) {
                  <span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                    Đã đánh giá
                  </span>
                } @else {
                  <button
                    class="px-3 py-1.5 text-xs bg-brand-fuchsia text-white rounded-full font-semibold"
                    (click)="startDraft(item)"
                  >
                    Viết đánh giá
                  </button>
                }
              </div>
            }
          </div>
        }
      }

      <!-- Mine -->
      @if (tab() === 'mine') {
        @if (loadingMine()) {
          <div class="py-10 text-center text-brand-muted text-sm">Đang tải...</div>
        } @else if (mine().length === 0) {
          <div class="py-10 text-center bg-white border rounded-skincare text-brand-muted text-sm">
            Bạn chưa đăng đánh giá nào.
          </div>
        } @else {
          <div class="space-y-3">
            @for (rv of mine(); track rv.id) {
              <article class="bg-white border rounded-skincare p-4 space-y-2">
                <header class="flex items-center justify-between">
                  <span class="text-amber-400 text-sm">{{ stars(rv.rating) }}</span>
                  <time class="text-[10px] text-brand-muted">{{ rv.createdAt | date: 'dd/MM/yyyy' }}</time>
                </header>
                @if (rv.title) {
                  <h3 class="font-semibold text-sm">{{ rv.title }}</h3>
                }
                @if (rv.body) {
                  <p class="text-xs text-brand-charcoal/80 whitespace-pre-line">{{ rv.body }}</p>
                }
                <div class="flex justify-end space-x-2 pt-1">
                  <button
                    class="text-[11px] text-brand-fuchsia hover:underline"
                    (click)="startEdit(rv)"
                  >
                    Sửa
                  </button>
                  <button
                    class="text-[11px] text-rose-500 hover:underline"
                    (click)="onDelete(rv)"
                  >
                    Xoá
                  </button>
                </div>
              </article>
            }
          </div>
        }
      }

      <!-- Modal -->
      @if (draft(); as d) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div class="bg-white rounded-skincare max-w-md w-full p-6 space-y-3">
            <h2 class="font-serif text-lg text-brand-charcoal">
              {{ editingId() ? 'Sửa đánh giá' : 'Viết đánh giá' }}
            </h2>
            <div>
              <label class="text-xs text-brand-muted">Điểm (1-5)</label>
              <div class="flex space-x-1 mt-1">
                @for (s of [1, 2, 3, 4, 5]; track s) {
                  <button
                    class="text-2xl"
                    [class.text-amber-400]="s <= d.rating"
                    [class.text-stone-300]="s > d.rating"
                    (click)="setRating(s)"
                  >★</button>
                }
              </div>
            </div>
            <div>
              <label class="text-xs text-brand-muted">Tiêu đề</label>
              <input
                class="w-full border rounded px-3 py-2 text-sm mt-1"
                [(ngModel)]="d.title"
                maxlength="255"
              />
            </div>
            <div>
              <label class="text-xs text-brand-muted">Nội dung</label>
              <textarea
                class="w-full border rounded px-3 py-2 text-sm mt-1"
                rows="4"
                [(ngModel)]="d.body"
                maxlength="5000"
              ></textarea>
            </div>
            <div>
              <label class="text-xs text-brand-muted">Loại da (tuỳ chọn)</label>
              <select class="w-full border rounded px-3 py-2 text-sm mt-1" [(ngModel)]="d.skinType">
                <option value="">--</option>
                <option value="OILY">Da dầu</option>
                <option value="DRY">Da khô</option>
                <option value="COMBINATION">Da hỗn hợp</option>
                <option value="SENSITIVE">Da nhạy cảm</option>
                <option value="NORMAL">Da thường</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-brand-muted">Hình ảnh / video (tối đa 5)</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime"
                class="w-full text-xs mt-1"
                (change)="onPickMedia($event)"
                [disabled]="uploading() || d.mediaUrls.length >= 5"
              />
              @if (uploading()) {
                <p class="text-[10px] text-brand-muted mt-1">Đang tải lên...</p>
              }
              @if (d.mediaUrls.length > 0) {
                <div class="flex flex-wrap gap-2 mt-2">
                  @for (url of d.mediaUrls; track url) {
                    <div class="relative">
                      <img [src]="url" class="w-16 h-16 object-cover rounded border" />
                      <button
                        type="button"
                        class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full"
                        (click)="removeMedia(url)"
                      >×</button>
                    </div>
                  }
                </div>
              }
            </div>
            @if (submitError()) {
              <p class="text-xs text-rose-500">{{ submitError() }}</p>
            }
            <div class="flex justify-end space-x-2 pt-2">
              <button
                class="px-4 py-2 text-xs border rounded-full"
                [disabled]="submitting()"
                (click)="cancelDraft()"
              >
                Huỷ
              </button>
              <button
                class="px-4 py-2 text-xs bg-brand-fuchsia text-white rounded-full font-semibold disabled:opacity-50"
                [disabled]="submitting() || !d.rating"
                (click)="onSubmit()"
              >
                {{ submitting() ? 'Đang gửi...' : 'Gửi' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MyReviewsComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tab = signal<Tab>('eligible');

  readonly eligible = signal<EligibilityDTO[]>([]);
  readonly mine = signal<ReviewDTO[]>([]);
  readonly loadingEligible = signal(false);
  readonly loadingMine = signal(false);

  readonly draft = signal<DraftReview | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal('');
  readonly uploading = signal(false);

  readonly pendingEligibleCount = computed(
    () => this.eligible().filter((e) => !e.reviewed).length,
  );

  ngOnInit(): void {
    this.loadEligible();
  }

  stars(rating: number): string {
    const full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  loadEligible(): void {
    this.loadingEligible.set(true);
    this.reviewService
      .getEligibleItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingEligible.set(false);
          this.eligible.set(res.data ?? []);
        },
        error: () => this.loadingEligible.set(false),
      });
  }

  loadMine(): void {
    if (this.mine().length > 0) return;
    this.loadingMine.set(true);
    this.reviewService
      .getMyReviews(0, 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingMine.set(false);
          this.mine.set(res.data?.content ?? []);
        },
        error: () => this.loadingMine.set(false),
      });
  }

  startDraft(item: EligibilityDTO): void {
    this.editingId.set(null);
    this.submitError.set('');
    this.draft.set({
      productId: item.productId,
      orderItemId: item.orderItemId,
      rating: 5,
      title: '',
      body: '',
      skinType: '',
      mediaUrls: [],
    });
  }

  startEdit(rv: ReviewDTO): void {
    this.editingId.set(rv.id);
    this.submitError.set('');
    this.draft.set({
      productId: rv.productId,
      orderItemId: rv.orderItemId,
      rating: rv.rating,
      title: rv.title ?? '',
      body: rv.body ?? '',
      skinType: (rv.skinType as SkinTypeTag) ?? '',
      mediaUrls: rv.media?.map((m) => m.url) ?? [],
    });
  }

  onPickMedia(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;
    const d = this.draft();
    if (!d) return;

    const remaining = 5 - d.mediaUrls.length;
    const accepted = files.slice(0, remaining);
    if (accepted.length === 0) return;

    this.uploading.set(true);
    let pending = accepted.length;
    let errored = false;

    accepted.forEach((file) => {
      this.reviewService
        .uploadMediaFile(file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (url) => {
            const cur = this.draft();
            if (cur) this.draft.set({ ...cur, mediaUrls: [...cur.mediaUrls, url] });
            if (--pending === 0) this.uploading.set(false);
          },
          error: (err) => {
            errored = true;
            this.submitError.set(err?.message || 'Upload thất bại.');
            if (--pending === 0) this.uploading.set(false);
          },
        });
    });
  }

  removeMedia(url: string): void {
    const d = this.draft();
    if (!d) return;
    this.draft.set({ ...d, mediaUrls: d.mediaUrls.filter((u) => u !== url) });
  }

  cancelDraft(): void {
    this.draft.set(null);
    this.editingId.set(null);
  }

  setRating(value: number): void {
    const d = this.draft();
    if (!d) return;
    this.draft.set({ ...d, rating: value });
  }

  onSubmit(): void {
    const d = this.draft();
    if (!d) return;
    this.submitting.set(true);
    this.submitError.set('');

    const skinType = d.skinType ? (d.skinType as SkinTypeTag) : undefined;
    const editingId = this.editingId();

    if (editingId !== null) {
      const body: UpdateReviewRequest = {
        rating: d.rating,
        title: d.title || undefined,
        body: d.body || undefined,
        skinType,
        mediaUrls: d.mediaUrls.length ? d.mediaUrls : undefined,
      };
      this.reviewService
        .updateReview(editingId, body)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.draft.set(null);
            this.editingId.set(null);
            this.mine.set([]);
            this.loadMine();
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err?.message || 'Cập nhật thất bại.');
          },
        });
    } else {
      const body: CreateReviewRequest = {
        orderItemId: d.orderItemId,
        rating: d.rating,
        title: d.title || undefined,
        body: d.body || undefined,
        skinType,
        mediaUrls: d.mediaUrls.length ? d.mediaUrls : undefined,
      };
      this.reviewService
        .createReview(d.productId, body)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.draft.set(null);
            this.loadEligible();
            this.mine.set([]);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err?.message || 'Đăng đánh giá thất bại.');
          },
        });
    }
  }

  onDelete(rv: ReviewDTO): void {
    if (!confirm('Xác nhận xoá đánh giá này?')) return;
    this.reviewService
      .deleteReview(rv.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.mine.update((list) => list.filter((r) => r.id !== rv.id));
        },
        error: (err) => alert(err?.message || 'Xoá thất bại.'),
      });
  }
}
