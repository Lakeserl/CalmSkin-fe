import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../core/services/admin.service';
import {
  AdminReviewStatsDTO,
  ReportStatus,
  ReviewDTO,
  ReviewReportDTO,
  ReviewStatus,
} from '../../../core/models/review.model';

type Tab = 'reviews' | 'reports';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">
      <div class="border-b border-slate-800 pb-5">
        <h1 class="text-3xl font-serif font-bold text-white">Kiểm duyệt đánh giá</h1>
        <p class="text-xs text-slate-400 mt-1">
          Quản lý đánh giá sản phẩm và xử lý báo cáo từ người dùng.
        </p>
      </div>

      <!-- Stats -->
      @if (stats(); as s) {
        <div class="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p class="text-slate-400">Tổng</p>
            <p class="text-xl font-bold text-white">{{ s.totalReviews }}</p>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p class="text-slate-400">Đã đăng</p>
            <p class="text-xl font-bold text-emerald-400">{{ s.publishedCount }}</p>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p class="text-slate-400">Chờ duyệt</p>
            <p class="text-xl font-bold text-amber-400">{{ s.pendingModerationCount }}</p>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p class="text-slate-400">Đã ẩn</p>
            <p class="text-xl font-bold text-slate-300">{{ s.hiddenCount }}</p>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p class="text-slate-400">Đã xoá</p>
            <p class="text-xl font-bold text-rose-400">{{ s.deletedCount }}</p>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p class="text-slate-400">Báo cáo chờ</p>
            <p class="text-xl font-bold text-rose-400">{{ s.pendingReportsCount }}</p>
          </div>
        </div>
      }

      <!-- Tabs -->
      <div class="flex space-x-2 text-xs font-semibold">
        <button
          class="px-4 py-2 rounded-full border border-slate-700"
          [class.bg-brand-fuchsia]="tab() === 'reviews'"
          (click)="tab.set('reviews'); loadReviews()"
        >
          Đánh giá
        </button>
        <button
          class="px-4 py-2 rounded-full border border-slate-700"
          [class.bg-brand-fuchsia]="tab() === 'reports'"
          (click)="tab.set('reports'); loadReports()"
        >
          Báo cáo
        </button>
      </div>

      <!-- Reviews tab -->
      @if (tab() === 'reviews') {
        <div class="flex flex-wrap gap-2 text-[11px]">
          <span class="text-slate-400 self-center">Lọc trạng thái:</span>
          @for (st of statusFilters; track st.value) {
            <button
              class="px-3 py-1 rounded-full border border-slate-700"
              [class.bg-brand-fuchsia]="statusFilter() === st.value"
              (click)="setStatusFilter(st.value)"
            >
              {{ st.label }}
            </button>
          }
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          @if (loadingReviews()) {
            <div class="p-10 text-center text-slate-400 text-sm">Đang tải...</div>
          } @else if (reviews().length === 0) {
            <div class="p-10 text-center text-slate-400 text-sm">Không có đánh giá nào.</div>
          } @else {
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-950 text-slate-400">
                <tr>
                  <th class="p-3">#</th>
                  <th class="p-3">Sản phẩm</th>
                  <th class="p-3">Đánh giá</th>
                  <th class="p-3">Trạng thái</th>
                  <th class="p-3">Báo cáo</th>
                  <th class="p-3">Ngày tạo</th>
                  <th class="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                @for (rv of reviews(); track rv.id) {
                  <tr class="border-t border-slate-800 hover:bg-slate-800/40">
                    <td class="p-3 font-mono">{{ rv.id }}</td>
                    <td class="p-3">#{{ rv.productId }}</td>
                    <td class="p-3 max-w-md">
                      <div class="text-amber-400">{{ stars(rv.rating) }}</div>
                      @if (rv.title) { <div class="font-semibold text-white">{{ rv.title }}</div> }
                      @if (rv.body) { <div class="text-slate-300 line-clamp-2">{{ rv.body }}</div> }
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase" [ngClass]="statusClass(rv.status)">
                        {{ rv.status }}
                      </span>
                    </td>
                    <td class="p-3 text-rose-400">{{ rv.reportCount }}</td>
                    <td class="p-3 text-slate-400">{{ rv.createdAt | date: 'dd/MM/yyyy' }}</td>
                    <td class="p-3 text-right space-x-1">
                      @if (rv.status !== 'PUBLISHED') {
                        <button class="px-2 py-0.5 bg-emerald-600 rounded text-white" (click)="setStatus(rv, 'PUBLISHED')">Đăng</button>
                      }
                      @if (rv.status !== 'HIDDEN') {
                        <button class="px-2 py-0.5 bg-slate-600 rounded text-white" (click)="setStatus(rv, 'HIDDEN')">Ẩn</button>
                      }
                      @if (rv.status !== 'DELETED') {
                        <button class="px-2 py-0.5 bg-rose-600 rounded text-white" (click)="setStatus(rv, 'DELETED')">Xoá</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (reviewsHasNext()) {
              <div class="p-4 text-center border-t border-slate-800">
                <button
                  class="px-5 py-2 border border-slate-700 rounded-full text-xs"
                  [disabled]="loadingReviews()"
                  (click)="loadMoreReviews()"
                >
                  Xem thêm
                </button>
              </div>
            }
          }
        </div>
      }

      <!-- Reports tab -->
      @if (tab() === 'reports') {
        <div class="flex flex-wrap gap-2 text-[11px]">
          <span class="text-slate-400 self-center">Trạng thái báo cáo:</span>
          @for (rs of reportStatuses; track rs) {
            <button
              class="px-3 py-1 rounded-full border border-slate-700"
              [class.bg-brand-fuchsia]="reportStatusFilter() === rs"
              (click)="setReportStatusFilter(rs)"
            >
              {{ rs }}
            </button>
          }
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          @if (loadingReports()) {
            <div class="p-10 text-center text-slate-400 text-sm">Đang tải...</div>
          } @else if (reports().length === 0) {
            <div class="p-10 text-center text-slate-400 text-sm">Không có báo cáo nào.</div>
          } @else {
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-950 text-slate-400">
                <tr>
                  <th class="p-3">#</th>
                  <th class="p-3">Review</th>
                  <th class="p-3">Lý do</th>
                  <th class="p-3">Chi tiết</th>
                  <th class="p-3">Trạng thái</th>
                  <th class="p-3">Ngày</th>
                  <th class="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                @for (rp of reports(); track rp.id) {
                  <tr class="border-t border-slate-800">
                    <td class="p-3 font-mono">{{ rp.id }}</td>
                    <td class="p-3">#{{ rp.reviewId }}</td>
                    <td class="p-3">{{ rp.reason }}</td>
                    <td class="p-3 max-w-md text-slate-300 line-clamp-2">{{ rp.detail }}</td>
                    <td class="p-3">{{ rp.status }}</td>
                    <td class="p-3 text-slate-400">{{ rp.createdAt | date: 'dd/MM/yyyy' }}</td>
                    <td class="p-3 text-right space-x-1">
                      @if (rp.status === 'PENDING') {
                        <button class="px-2 py-0.5 bg-emerald-600 rounded text-white" (click)="resolveReport(rp, 'DISMISSED')">Bỏ qua</button>
                        <button class="px-2 py-0.5 bg-rose-600 rounded text-white" (click)="resolveReport(rp, 'ACTION_TAKEN')">Xử lý</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
    </div>
  `,
})
export class AdminReviewsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tab = signal<Tab>('reviews');
  readonly stats = signal<AdminReviewStatsDTO | null>(null);

  readonly reviews = signal<ReviewDTO[]>([]);
  readonly loadingReviews = signal(false);
  readonly reviewsHasNext = signal(false);
  readonly statusFilter = signal<ReviewStatus | null>(null);
  private reviewsPage = 0;

  readonly reports = signal<ReviewReportDTO[]>([]);
  readonly loadingReports = signal(false);
  readonly reportStatusFilter = signal<ReportStatus>('PENDING');

  readonly statusFilters: { label: string; value: ReviewStatus | null }[] = [
    { label: 'Tất cả', value: null },
    { label: 'Chờ duyệt', value: 'PENDING_MODERATION' },
    { label: 'Đã đăng', value: 'PUBLISHED' },
    { label: 'Đã ẩn', value: 'HIDDEN' },
    { label: 'Đã xoá', value: 'DELETED' },
  ];

  readonly reportStatuses: ReportStatus[] = ['PENDING', 'DISMISSED', 'ACTION_TAKEN'];

  ngOnInit(): void {
    this.loadStats();
    this.loadReviews();
  }

  stars(rating: number): string {
    const full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  statusClass(s: ReviewStatus): Record<string, boolean> {
    return {
      'bg-emerald-500/20 text-emerald-400': s === 'PUBLISHED',
      'bg-amber-500/20 text-amber-400': s === 'PENDING_MODERATION',
      'bg-slate-500/20 text-slate-300': s === 'HIDDEN',
      'bg-rose-500/20 text-rose-400': s === 'DELETED',
    };
  }

  private loadStats(): void {
    this.adminService
      .getReviewStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.stats.set(res.data ?? null),
        error: () => this.stats.set(null),
      });
  }

  setStatusFilter(s: ReviewStatus | null): void {
    if (this.statusFilter() === s) return;
    this.statusFilter.set(s);
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewsPage = 0;
    this.reviews.set([]);
    this.fetchReviews(false);
  }

  loadMoreReviews(): void {
    this.reviewsPage += 1;
    this.fetchReviews(true);
  }

  private fetchReviews(append: boolean): void {
    this.loadingReviews.set(true);
    this.adminService
      .listReviewsAdmin({
        status: this.statusFilter() ?? undefined,
        page: this.reviewsPage,
        size: 20,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingReviews.set(false);
          const list = res.data?.content ?? [];
          this.reviews.set(append ? [...this.reviews(), ...list] : list);
          this.reviewsHasNext.set(!(res.data?.last ?? true));
        },
        error: () => this.loadingReviews.set(false),
      });
  }

  setStatus(rv: ReviewDTO, status: ReviewStatus): void {
    const note = prompt(`Ghi chú khi chuyển trạng thái sang ${status} (tuỳ chọn):`) ?? undefined;
    this.adminService
      .updateReviewStatus(rv.id, { status, adminNote: note })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.reviews.update((list) =>
            list.map((r) => (r.id === rv.id ? res.data ?? r : r)),
          );
          this.loadStats();
        },
        error: (err) => alert(err?.message || 'Cập nhật trạng thái thất bại.'),
      });
  }

  // Reports tab
  setReportStatusFilter(s: ReportStatus): void {
    if (this.reportStatusFilter() === s) return;
    this.reportStatusFilter.set(s);
    this.loadReports();
  }

  loadReports(): void {
    this.loadingReports.set(true);
    this.adminService
      .listReviewReports({ status: this.reportStatusFilter(), page: 0, size: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingReports.set(false);
          this.reports.set(res.data?.content ?? []);
        },
        error: () => this.loadingReports.set(false),
      });
  }

  resolveReport(rp: ReviewReportDTO, status: ReportStatus): void {
    this.adminService
      .resolveReviewReport(rp.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.reports.update((list) =>
            list.map((r) => (r.id === rp.id ? res.data ?? r : r)),
          );
          this.loadStats();
        },
        error: (err) => alert(err?.message || 'Xử lý báo cáo thất bại.'),
      });
  }
}
