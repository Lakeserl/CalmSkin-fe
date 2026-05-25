import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationStore } from '../store/notification.store';
import { UpdatePreferencesRequest } from '../model/notification.model';
import { WebPushService } from '../service/web-push.service';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-xl font-bold text-brand-charcoal mb-6">Cài đặt thông báo</h1>

      @if (store.isPrefsLoading() && !store.preferences()) {
        <div class="bg-white rounded-xl p-8 text-center text-brand-muted text-sm animate-pulse">Đang tải cài đặt...</div>
      } @else if (store.preferences(); as prefs) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">

          <!-- Channels -->
          <section class="p-5">
            <h2 class="text-sm font-semibold text-brand-charcoal mb-4">Kênh nhận thông báo</h2>
            <div class="space-y-3">
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-brand-charcoal">Email</span>
                <input type="checkbox" [(ngModel)]="emailEnabled" (change)="save()" class="w-4 h-4 accent-brand-fuchsia" />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-brand-charcoal">Web Push</span>
                <input type="checkbox" [(ngModel)]="webPushEnabled" (change)="onWebPushToggle()" class="w-4 h-4 accent-brand-fuchsia" />
              </label>
              @if (pushError()) {
                <p class="text-xs text-rose-500">{{ pushError() }}</p>
              }
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm text-brand-charcoal">Trong ứng dụng</span>
                <input type="checkbox" [(ngModel)]="inAppEnabled" (change)="save()" class="w-4 h-4 accent-brand-fuchsia" />
              </label>
            </div>
          </section>

          <!-- Categories -->
          <section class="p-5">
            <h2 class="text-sm font-semibold text-brand-charcoal mb-4">Loại thông báo</h2>
            <div class="space-y-3">
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <p class="text-sm text-brand-charcoal">Cập nhật đơn hàng</p>
                  <p class="text-xs text-brand-muted">Trạng thái đơn hàng, giao hàng</p>
                </div>
                <input type="checkbox" [(ngModel)]="orderUpdates" (change)="save()" class="w-4 h-4 accent-brand-fuchsia" />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <p class="text-sm text-brand-charcoal">Khuyến mãi</p>
                  <p class="text-xs text-brand-muted">Flash sale, mã giảm giá, ưu đãi</p>
                </div>
                <input type="checkbox" [(ngModel)]="promotions" (change)="save()" class="w-4 h-4 accent-brand-fuchsia" />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <p class="text-sm text-brand-charcoal">Đánh giá sản phẩm</p>
                  <p class="text-xs text-brand-muted">Phản hồi đánh giá của bạn</p>
                </div>
                <input type="checkbox" [(ngModel)]="reviews" (change)="save()" class="w-4 h-4 accent-brand-fuchsia" />
              </label>
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <p class="text-sm text-brand-charcoal">Cảnh báo bảo mật</p>
                  <p class="text-xs text-brand-muted">Đăng nhập từ thiết bị mới (không thể tắt)</p>
                </div>
                <input type="checkbox" [ngModel]="true" disabled class="w-4 h-4 accent-brand-fuchsia opacity-50 cursor-not-allowed" />
              </label>
            </div>
          </section>

          <!-- Quiet Hours -->
          <section class="p-5">
            <h2 class="text-sm font-semibold text-brand-charcoal mb-1">Giờ im lặng</h2>
            <p class="text-xs text-brand-muted mb-4">Không nhận thông báo trong khoảng thời gian này</p>
            <div class="flex items-center gap-3">
              <div>
                <label class="text-xs text-brand-muted block mb-1">Từ</label>
                <input
                  type="time"
                  [(ngModel)]="quietStart"
                  (change)="save()"
                  class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-fuchsia"
                />
              </div>
              <span class="text-brand-muted mt-5">—</span>
              <div>
                <label class="text-xs text-brand-muted block mb-1">Đến</label>
                <input
                  type="time"
                  [(ngModel)]="quietEnd"
                  (change)="save()"
                  class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-fuchsia"
                />
              </div>
            </div>
          </section>

        </div>

        @if (saved()) {
          <p class="mt-3 text-xs text-green-600 font-medium text-center">✓ Đã lưu cài đặt</p>
        }
      } @else {
        <div class="bg-white rounded-xl p-8 text-center text-brand-muted text-sm">Không thể tải cài đặt thông báo.</div>
      }
    </div>
  `,
})
export class NotificationPreferencesComponent implements OnInit {
  readonly store = inject(NotificationStore);
  private readonly webPush = inject(WebPushService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saved = signal(false);
  readonly pushError = signal('');

  emailEnabled = false;
  webPushEnabled = false;
  inAppEnabled = true;
  orderUpdates = true;
  promotions = true;
  reviews = true;
  stockAlerts = false;
  quietStart = '';
  quietEnd = '';

  ngOnInit(): void {
    this.store.loadPreferences();
    const prefs = this.store.preferences();
    if (prefs) this.applyPrefs(prefs);
  }

  private applyPrefs(p: NonNullable<ReturnType<typeof this.store.preferences>>): void {
    this.emailEnabled = p.emailEnabled;
    this.webPushEnabled = p.webPushEnabled;
    this.inAppEnabled = p.inAppEnabled;
    this.orderUpdates = p.orderUpdates;
    this.promotions = p.promotions;
    this.reviews = p.reviews;
    this.stockAlerts = p.stockAlerts;
    this.quietStart = p.quietHoursStart ?? '';
    this.quietEnd = p.quietHoursEnd ?? '';
  }

  onWebPushToggle(): void {
    this.pushError.set('');
    const want = this.webPushEnabled;
    const action = want ? this.webPush.enable() : this.webPush.disable();
    action.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.save(),
      error: (err) => {
        // Revert the toggle if the browser refused or unsupported.
        this.webPushEnabled = !want;
        this.pushError.set(err?.message || 'Không thể bật/tắt Web Push.');
      },
    });
  }

  save(): void {
    const payload: UpdatePreferencesRequest = {
      emailEnabled: this.emailEnabled,
      webPushEnabled: this.webPushEnabled,
      inAppEnabled: this.inAppEnabled,
      orderUpdates: this.orderUpdates,
      promotions: this.promotions,
      reviews: this.reviews,
      stockAlerts: this.stockAlerts,
      quietHoursStart: this.quietStart || undefined,
      quietHoursEnd: this.quietEnd || undefined,
    };
    this.store.updatePreferences(payload);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
