import { Injectable, inject } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

/**
 * Registers the SW, subscribes/unsubscribes to PushManager, and forwards the
 * resulting endpoint to notification-service. Browser & permission flow only —
 * preference persistence lives on the store.
 */
@Injectable({ providedIn: 'root' })
export class WebPushService {
  private readonly notif = inject(NotificationService);
  private readonly swPath = '/sw.js';

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /** Enable: register SW, ensure permission, subscribe, send sub to BE. */
  enable(): Observable<void> {
    if (!this.isSupported()) {
      return throwError(() => new Error('Trình duyệt không hỗ trợ Web Push.'));
    }
    return from(navigator.serviceWorker.register(this.swPath)).pipe(
      switchMap((reg) =>
        from(Notification.requestPermission()).pipe(
          switchMap((perm) => {
            if (perm !== 'granted') {
              return throwError(() => new Error('Bạn đã từ chối quyền thông báo.'));
            }
            return this.subscribeAndPush(reg);
          }),
        ),
      ),
    );
  }

  /** Disable: unsubscribe browser + tell BE to delete the sub. */
  disable(): Observable<void> {
    if (!this.isSupported()) return of(void 0);
    return from(navigator.serviceWorker.getRegistration(this.swPath)).pipe(
      switchMap((reg) => from(reg?.pushManager.getSubscription() ?? Promise.resolve(null))),
      switchMap((sub) => (sub ? from(sub.unsubscribe()) : of(true))),
      switchMap(() => this.notif.unsubscribePush()),
      switchMap(() => of(void 0)),
      catchError(() => of(void 0)),
    );
  }

  private subscribeAndPush(reg: ServiceWorkerRegistration): Observable<void> {
    return this.notif.getVapidPublicKey().pipe(
      switchMap((res) => {
        const vapid = res.data?.vapidPublicKey;
        if (!vapid) {
          return throwError(() => new Error('Thiếu VAPID key từ máy chủ.'));
        }
        return from(
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapid),
          }),
        );
      }),
      switchMap((sub) => this.notif.subscribePush(sub.toJSON())),
      tap(),
      switchMap(() => of(void 0)),
    );
  }

  /**
   * VAPID server key arrives base64url-encoded; PushManager wants a BufferSource
   * backed by a real ArrayBuffer (TS lib types reject the lib-default SharedArrayBuffer
   * union returned by `new Uint8Array(n)`).
   */
  private urlBase64ToUint8Array(base64: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64);
    const buf = new ArrayBuffer(raw.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
    return buf;
  }
}
