import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { NotificationDTO, NotificationPreferencesDTO, UpdatePreferencesRequest } from '../model/notification.model';
import { NotificationService } from '../service/notification.service';

interface NotificationState {
  notifications: NotificationDTO[];
  unreadCount: number;
  preferences: NotificationPreferencesDTO | null;
  isLoading: boolean;
  isPrefsLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  isLoading: false,
  isPrefsLoading: false,
  error: null,
  page: 0,
  hasMore: true,
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ unreadCount }) => ({
    hasUnread: computed(() => unreadCount() > 0),
    unreadLabel: computed(() => {
      const n = unreadCount();
      return n > 99 ? '99+' : n > 0 ? String(n) : '';
    }),
  })),
  withMethods((store, svc = inject(NotificationService)) => ({
    loadNotifications(reset = false): void {
      patchState(store, { isLoading: true, error: null });
      const p = reset ? 0 : store.page();
      svc.getNotifications(p, 20).subscribe({
        next: (res) => {
          const list: NotificationDTO[] = res.data?.content ?? [];
          patchState(store, {
            notifications: reset ? list : [...store.notifications(), ...list],
            isLoading: false,
            page: p + 1,
            hasMore: list.length === 20,
          });
        },
        error: (err) => patchState(store, { isLoading: false, error: err.message }),
      });
    },

    loadUnreadCount(): void {
      svc.getUnreadCount().subscribe({
        next: (res) => patchState(store, { unreadCount: res.data?.count ?? 0 }),
        error: () => {},
      });
    },

    markRead(id: number): void {
      svc.markRead(id).subscribe({
        next: () =>
          patchState(store, {
            notifications: store.notifications().map((n) => (n.id === id ? { ...n, read: true } : n)),
            unreadCount: Math.max(0, store.unreadCount() - 1),
          }),
        error: () => {},
      });
    },

    markAllRead(): void {
      svc.markAllRead().subscribe({
        next: () =>
          patchState(store, {
            notifications: store.notifications().map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }),
        error: () => {},
      });
    },

    deleteNotification(id: number): void {
      const wasUnread = store.notifications().some((n) => n.id === id && !n.read);
      svc.deleteNotification(id).subscribe({
        next: () =>
          patchState(store, {
            notifications: store.notifications().filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, store.unreadCount() - 1) : store.unreadCount(),
          }),
        error: () => {},
      });
    },

    loadPreferences(): void {
      patchState(store, { isPrefsLoading: true });
      svc.getPreferences().subscribe({
        next: (res) => patchState(store, { preferences: res.data, isPrefsLoading: false }),
        error: () => patchState(store, { isPrefsLoading: false }),
      });
    },

    updatePreferences(data: UpdatePreferencesRequest): void {
      svc.updatePreferences(data).subscribe({
        next: (res) => patchState(store, { preferences: res.data }),
        error: () => {},
      });
    },
  })),
);
