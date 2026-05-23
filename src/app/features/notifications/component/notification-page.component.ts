import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationStore } from '../store/notification.store';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-brand-charcoal">Thông báo của tôi</h1>
        <div class="flex items-center gap-3">
          @if (store.hasUnread()) {
            <button
              (click)="store.markAllRead()"
              class="text-sm text-brand-fuchsia hover:underline font-medium focus:outline-none"
            >Đánh dấu tất cả đã đọc</button>
          }
          <a routerLink="/notifications/preferences" class="text-sm text-brand-muted hover:text-brand-fuchsia transition-colors">Cài đặt</a>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        @if (store.isLoading() && store.notifications().length === 0) {
          @for (i of [1,2,3,4,5]; track i) {
            <div class="px-5 py-4 animate-pulse flex gap-4">
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                <div class="h-2.5 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          }
        } @else if (store.notifications().length === 0) {
          <div class="py-16 text-center">
            <svg class="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p class="text-sm text-brand-muted">Chưa có thông báo nào.</p>
          </div>
        } @else {
          @for (n of store.notifications(); track n.id) {
            <div
              class="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              [class.bg-brand-rosewater/40]="!n.read"
              (click)="!n.read && store.markRead(n.id)"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm font-semibold text-brand-charcoal" [class.font-normal]="n.read">{{ n.subject }}</p>
                  @if (!n.read) {
                    <span class="w-2 h-2 rounded-full bg-brand-fuchsia shrink-0 mt-1.5"></span>
                  }
                </div>
                <p class="text-sm text-brand-muted mt-1 line-clamp-2">{{ n.body }}</p>
                <p class="text-xs text-stone-400 mt-1.5">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <button
                (click)="onDelete($event, n.id)"
                class="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 focus:outline-none focus:opacity-100 mt-0.5"
                aria-label="Xóa thông báo"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          }
          @if (store.hasMore()) {
            <div class="px-5 py-4 text-center">
              <button
                (click)="store.loadNotifications()"
                [disabled]="store.isLoading()"
                class="text-sm text-brand-fuchsia font-medium hover:underline disabled:opacity-50 focus:outline-none"
              >
                @if (store.isLoading()) { Đang tải... } @else { Xem thêm }
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class NotificationPageComponent implements OnInit {
  readonly store = inject(NotificationStore);

  ngOnInit(): void {
    this.store.loadNotifications(true);
  }

  onDelete(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.store.deleteNotification(id);
  }
}
