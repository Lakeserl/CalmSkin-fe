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
import { ShipmentDTO, ShipmentStatus } from '../../../core/models/shipment.model';

@Component({
  selector: 'app-admin-shipments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">
      <div class="border-b border-slate-800 pb-5">
        <h1 class="text-3xl font-serif font-bold text-white">Quản Lý Vận Chuyển</h1>
        <p class="text-xs text-slate-400 mt-1">
          Theo dõi đơn vận chuyển, cập nhật trạng thái thủ công và huỷ shipment khi cần.
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
        @for (s of filters; track s.value) {
          <button
            class="px-4 py-2 rounded-full border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-all"
            [class.bg-brand-fuchsia]="activeStatus() === s.value"
            [class.border-brand-fuchsia]="activeStatus() === s.value"
            (click)="selectStatus(s.value)"
          >
            {{ s.label }}
          </button>
        }
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
        @if (isLoading()) {
          <div class="p-16 text-center text-slate-400">Đang tải danh sách vận chuyển...</div>
        } @else if (errorMessage()) {
          <div class="p-12 text-center space-y-3">
            <p class="text-rose-400">{{ errorMessage() }}</p>
            <button class="px-4 py-2 bg-brand-fuchsia text-white rounded-full text-xs font-bold" (click)="load()">Thử lại</button>
          </div>
        } @else if (shipments().length === 0) {
          <div class="p-16 text-center text-slate-400">Không có shipment nào ở trạng thái này.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 font-bold bg-slate-950 text-slate-400">
                  <th class="p-4">Mã Đơn / Tracking</th>
                  <th class="p-4">Người nhận</th>
                  <th class="p-4">Đơn vị</th>
                  <th class="p-4">Trạng thái</th>
                  <th class="p-4">Phí ship</th>
                  <th class="p-4">COD</th>
                  <th class="p-4">Dự kiến giao</th>
                  <th class="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                @for (s of shipments(); track s.id) {
                  <tr class="border-b border-slate-800 hover:bg-slate-800/40">
                    <td class="p-4">
                      <p class="font-mono font-bold text-white">{{ s.orderNumber }}</p>
                      @if (s.trackingNumber) {
                        <p class="text-[10px] text-slate-400 font-mono">{{ s.trackingNumber }}</p>
                      }
                    </td>
                    <td class="p-4">
                      <p class="font-semibold text-slate-200">{{ s.recipientName }}</p>
                      <p class="text-[10px] text-slate-400">{{ s.recipientPhone }}</p>
                      <p class="text-[10px] text-slate-500">
                        {{ s.addressWard }}, {{ s.addressDistrict }}, {{ s.addressProvince }}
                      </p>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-slate-200">
                        {{ s.provider }}
                      </span>
                    </td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase" [ngClass]="statusClass(s.status)">
                        {{ getStatusText(s.status) }}
                      </span>
                    </td>
                    <td class="p-4 font-mono text-cyan-300">{{ (s.shippingFee ?? 0) | currency: 'VND' : 'symbol' : '1.0-0' }}</td>
                    <td class="p-4 font-mono text-amber-300">{{ (s.codAmount ?? 0) | currency: 'VND' : 'symbol' : '1.0-0' }}</td>
                    <td class="p-4 text-slate-400">
                      {{ s.estimatedDeliveryAt ? (s.estimatedDeliveryAt | date: 'dd/MM HH:mm') : '—' }}
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex flex-wrap items-center justify-center gap-1 font-bold text-[10px]">
                        <button class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-white" (click)="viewDetail(s)">Chi tiết</button>
                        @if (!isTerminal(s.status)) {
                          <button class="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 rounded text-white" (click)="updateStatus(s)">Cập nhật</button>
                        }
                        @if (isCancellable(s.status)) {
                          <button class="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 rounded text-white" (click)="cancel(s)">Huỷ</button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (hasNext()) {
            <div class="p-4 text-center border-t border-slate-800">
              <button
                class="px-5 py-2 border border-slate-700 text-slate-300 rounded-full text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                [disabled]="isLoading()"
                (click)="loadMore()"
              >
                Xem thêm
              </button>
            </div>
          }
        }
      </div>

      <!-- Detail drawer -->
      @if (selected(); as d) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" (click)="selected.set(null)">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4" (click)="$event.stopPropagation()">
            <header class="flex items-start justify-between">
              <div>
                <h2 class="text-lg font-serif text-white">Shipment #{{ d.id }}</h2>
                <p class="text-xs text-slate-400 font-mono">{{ d.orderNumber }} • {{ d.provider }}</p>
              </div>
              <button class="text-slate-400 hover:text-white" (click)="selected.set(null)">✕</button>
            </header>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div><p class="text-slate-500">Trạng thái</p><p class="text-white font-bold">{{ getStatusText(d.status) }}</p></div>
              <div><p class="text-slate-500">Tracking #</p><p class="text-white font-mono">{{ d.trackingNumber || '—' }}</p></div>
              <div><p class="text-slate-500">Cân nặng</p><p class="text-white">{{ d.weightG ?? '—' }} g</p></div>
              <div><p class="text-slate-500">Phí ship</p><p class="text-white font-mono">{{ (d.shippingFee ?? 0) | currency: 'VND' : 'symbol' : '1.0-0' }}</p></div>
              <div><p class="text-slate-500">Pickup dự kiến</p><p class="text-white">{{ d.estimatedPickupAt ? (d.estimatedPickupAt | date: 'dd/MM/yyyy HH:mm') : '—' }}</p></div>
              <div><p class="text-slate-500">Giao dự kiến</p><p class="text-white">{{ d.estimatedDeliveryAt ? (d.estimatedDeliveryAt | date: 'dd/MM/yyyy HH:mm') : '—' }}</p></div>
              <div><p class="text-slate-500">Đã pickup</p><p class="text-white">{{ d.pickedUpAt ? (d.pickedUpAt | date: 'dd/MM/yyyy HH:mm') : '—' }}</p></div>
              <div><p class="text-slate-500">Đã giao</p><p class="text-white">{{ d.deliveredAt ? (d.deliveredAt | date: 'dd/MM/yyyy HH:mm') : '—' }}</p></div>
            </div>
            @if (d.cancelReason) {
              <div class="text-xs text-rose-300 bg-rose-900/20 rounded p-2">
                Đã huỷ: {{ d.cancelReason }} ({{ d.cancelledAt | date: 'dd/MM HH:mm' }})
              </div>
            }
            <div>
              <h3 class="text-xs font-bold text-white mb-2">Lịch sử tracking</h3>
              @if (!d.trackingEvents?.length) {
                <p class="text-xs text-slate-500">Chưa có sự kiện.</p>
              } @else {
                <ul class="space-y-2">
                  @for (ev of d.trackingEvents!; track ev.id) {
                    <li class="border-l-2 border-slate-700 pl-3 text-xs">
                      <p class="text-white font-semibold">
                        {{ getStatusText(ev.status) }}
                        <span class="text-[10px] text-slate-500 ml-1">({{ ev.source }})</span>
                      </p>
                      @if (ev.description) { <p class="text-slate-300">{{ ev.description }}</p> }
                      @if (ev.location) { <p class="text-slate-400">📍 {{ ev.location }}</p> }
                      <time class="text-[10px] text-slate-500">{{ ev.occurredAt | date: 'dd/MM/yyyy HH:mm' }}</time>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminShipmentsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly shipments = signal<ShipmentDTO[]>([]);
  readonly selected = signal<ShipmentDTO | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly activeStatus = signal<string>('ALL');
  readonly hasNext = signal(false);

  private currentPage = 0;
  private readonly pageSize = 20;

  readonly filters: { label: string; value: string }[] = [
    { label: 'Tất Cả', value: 'ALL' },
    { label: 'Chờ Pickup', value: 'PENDING' },
    { label: 'Đang Lấy', value: 'PICKING' },
    { label: 'Đã Lấy', value: 'PICKED_UP' },
    { label: 'Vận Chuyển', value: 'IN_TRANSIT' },
    { label: 'Đang Giao', value: 'OUT_FOR_DELIVERY' },
    { label: 'Đã Giao', value: 'DELIVERED' },
    { label: 'Thất Bại', value: 'FAILED' },
    { label: 'Đã Huỷ', value: 'CANCELLED' },
    { label: 'Hoàn Trả', value: 'RETURNED' },
  ];

  ngOnInit(): void {
    this.load();
  }

  selectStatus(value: string): void {
    if (this.activeStatus() === value) return;
    this.activeStatus.set(value);
    this.load();
  }

  load(): void {
    this.currentPage = 0;
    this.shipments.set([]);
    this.fetch(false);
  }

  loadMore(): void {
    this.currentPage += 1;
    this.fetch(true);
  }

  private fetch(append: boolean): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const status = this.activeStatus() === 'ALL' ? undefined : (this.activeStatus() as ShipmentStatus);
    this.adminService
      .listShipments({ status, page: this.currentPage, size: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          const list = res.data ?? [];
          this.shipments.set(append ? [...this.shipments(), ...list] : list);
          this.hasNext.set(!!res.page && res.page.hasNext);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.message || 'Không thể tải danh sách vận chuyển.');
        },
      });
  }

  viewDetail(s: ShipmentDTO): void {
    // List endpoint may omit trackingEvents; fetch the detail to be sure.
    this.adminService
      .getShipment(s.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.selected.set(res.data ?? s),
        error: () => this.selected.set(s),
      });
  }

  updateStatus(s: ShipmentDTO): void {
    const next = prompt(
      `Trạng thái mới (PENDING/PICKING/PICKED_UP/IN_TRANSIT/OUT_FOR_DELIVERY/DELIVERED/FAILED/CANCELLED/RETURNED):`,
      s.status,
    );
    if (!next) return;
    const normalized = next.trim().toUpperCase() as ShipmentStatus;
    const valid: ShipmentStatus[] = [
      'PENDING', 'PICKING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY',
      'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED',
    ];
    if (!valid.includes(normalized)) {
      alert('Trạng thái không hợp lệ.');
      return;
    }
    const description = prompt('Mô tả (tuỳ chọn):') ?? undefined;
    const location = prompt('Vị trí (tuỳ chọn):') ?? undefined;
    this.adminService
      .updateShipmentStatus(s.id, { status: normalized, description, location })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.shipments.update((list) => list.map((x) => (x.id === s.id ? res.data : x)));
          }
        },
        error: (err) => alert(err?.message || 'Cập nhật trạng thái thất bại.'),
      });
  }

  cancel(s: ShipmentDTO): void {
    const reason = prompt('Nhập lý do huỷ shipment:');
    if (!reason || !reason.trim()) return;
    this.adminService
      .cancelShipment(s.id, { reason: reason.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.shipments.update((list) => list.map((x) => (x.id === s.id ? res.data : x)));
          }
        },
        error: (err) => alert(err?.message || 'Huỷ shipment thất bại.'),
      });
  }

  isTerminal(s: ShipmentStatus): boolean {
    return s === 'DELIVERED' || s === 'CANCELLED' || s === 'RETURNED';
  }

  isCancellable(s: ShipmentStatus): boolean {
    return s === 'PENDING' || s === 'PICKING';
  }

  getStatusText(s: ShipmentStatus): string {
    const map: Record<ShipmentStatus, string> = {
      PENDING: 'Chờ pickup',
      PICKING: 'Đang lấy',
      PICKED_UP: 'Đã lấy',
      IN_TRANSIT: 'Vận chuyển',
      OUT_FOR_DELIVERY: 'Đang giao',
      DELIVERED: 'Đã giao',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã huỷ',
      RETURNED: 'Hoàn trả',
    };
    return map[s];
  }

  statusClass(s: ShipmentStatus): Record<string, boolean> {
    return {
      'bg-amber-500/20 text-amber-400': s === 'PENDING',
      'bg-blue-500/20 text-blue-400': s === 'PICKING',
      'bg-cyan-500/20 text-cyan-400': s === 'PICKED_UP',
      'bg-indigo-500/20 text-indigo-400': s === 'IN_TRANSIT',
      'bg-purple-500/20 text-purple-400': s === 'OUT_FOR_DELIVERY',
      'bg-emerald-500/20 text-emerald-400': s === 'DELIVERED',
      'bg-rose-500/20 text-rose-400': s === 'FAILED' || s === 'CANCELLED',
      'bg-orange-500/20 text-orange-400': s === 'RETURNED',
    };
  }
}
