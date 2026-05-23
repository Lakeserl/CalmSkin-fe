import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationStore } from '../store/notification.store';
import { NotificationPanelComponent } from './notification-panel.component';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [NotificationPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.isAuthenticated()) {
      <div class="relative">
        <button
          (click)="toggle()"
          class="p-2 text-brand-charcoal hover:text-brand-fuchsia relative rounded-full hover:bg-brand-rosewater transition-all duration-300 focus:outline-none"
          aria-label="Mở thông báo"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          @if (store.hasUnread()) {
            <span class="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[1.1rem] h-[1.1rem] px-0.5 flex items-center justify-center shadow">
              {{ store.unreadLabel() }}
            </span>
          }
        </button>

        @if (isOpen()) {
          <app-notification-panel (close)="isOpen.set(false)" />
        }
      </div>
    }
  `,
})
export class NotificationBellComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly store = inject(NotificationStore);
  readonly isOpen = signal(false);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.store.loadUnreadCount();
    }
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.store.loadNotifications(true);
    }
  }
}
