import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationStore } from '../store/notification.store';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 animate-fade-in z-50 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <h3 class="text-sm font-semibold text-brand-charcoal">Thông báo</h3>
        @if (store.hasUnread()) {
          <button
            (click)="store.markAllRead()"
            class="text-xs text-brand-fuchsia hover:underline font-medium focus:outline-none"
          >Đánh dấu tất cả đã đọc</button>
        }
      </div>

      <div class="max-h-80 overflow-y-auto divide-y divide-gray-50">
        @if (store.isLoading() && store.notifications().length === 0) {
          <div class="py-10 text-center text-xs text-brand-muted">Đang tải...</div>
        } @else if (store.notifications().length === 0) {
          <div class="py-10 text-center">
            <p class="text-sm text-brand-muted">Chưa có thông báo nào.</p>
          </div>
        } @else {
          @for (n of store.notifications(); track n.id) {
            <div
              class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              [class.bg-brand-rosewater]="!n.read"
              (click)="onRead(n.id)"
            >
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-brand-charcoal truncate">{{ n.subject }}</p>
                <p class="text-xs text-brand-muted mt-0.5 line-clamp-2">{{ n.body }}</p>
                <p class="text-[10px] text-stone-400 mt-1">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <button
                (click)="onDelete($event, n.id)"
                class="text-stone-300 hover:text-red-400 shrink-0 mt-0.5 focus:outline-none"
                aria-label="Xóa thông báo"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
          @if (store.hasMore()) {
            <button
              (click)="store.loadNotifications()"
              class="w-full py-3 text-xs text-brand-fuchsia font-medium hover:bg-brand-rosewater transition-colors focus:outline-none"
            >Xem thêm</button>
          }
        }
      </div>

      <div class="border-t px-4 py-2.5 flex justify-between items-center bg-gray-50">
        <a routerLink="/notifications/preferences" (click)="close.emit()" class="text-xs text-brand-muted hover:text-brand-fuchsia transition-colors">Cài đặt</a>
        <a routerLink="/notifications" (click)="close.emit()" class="text-xs text-brand-fuchsia font-semibold hover:underline">Tất cả thông báo →</a>
      </div>
    </div>
  `,
})
export class NotificationPanelComponent {
  readonly store = inject(NotificationStore);
  readonly close = output<void>();

  onRead(id: number): void {
    this.store.markRead(id);
  }

  onDelete(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.store.deleteNotification(id);
  }
}
