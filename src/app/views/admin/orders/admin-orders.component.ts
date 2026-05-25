import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { OrderStatus, OrderSummaryDTO } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">

      <div class="flex items-start justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 class="text-3xl font-serif font-bold text-white">Quản Lý Đơn Hàng</h1>
          <p class="text-xs text-slate-400 mt-1">Phê duyệt trạng thái thanh toán, đóng gói vận chuyển và xử lý hoàn trả CalmSKIN.</p>
        </div>
        <button
          (click)="exportCsv()"
          [disabled]="isExporting()"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full disabled:opacity-50"
        >
          {{ isExporting() ? 'Đang xuất...' : 'Xuất CSV' }}
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 text-xs font-semibold">
        @for (status of filterStatuses; track status.value) {
          <button
            (click)="selectStatus(status.value)"
            [class.bg-brand-fuchsia]="activeStatus() === status.value"
            [class.text-white]="activeStatus() === status.value"
            [class.border-brand-fuchsia]="activeStatus() === status.value"
            class="px-4 py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-full hover:bg-slate-800 transition-all"
          >
            {{ status.name }}
          </button>
        }
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
        @if (isLoading()) {
          <div class="p-20 text-center text-slate-400">Đang tải danh sách đơn hàng...</div>
        } @else if (errorMessage()) {
          <div class="p-16 text-center space-y-3">
            <p class="text-rose-400">{{ errorMessage() }}</p>
            <button (click)="loadOrders()" class="px-4 py-2 bg-brand-fuchsia text-white rounded-full text-xs font-bold">Thử lại</button>
          </div>
        } @else if (orders().length === 0) {
          <div class="p-20 text-center text-slate-400">Không có đơn hàng nào ở trạng thái này.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 font-bold bg-slate-950 text-slate-400">
                  <th class="p-4">Mã Đơn Hàng</th>
                  <th class="p-4">Khách Hàng</th>
                  <th class="p-4">Ngày Đặt</th>
                  <th class="p-4">Giá Trị</th>
                  <th class="p-4">SL</th>
                  <th class="p-4">Hình Thức</th>
                  <th class="p-4">Trạng Thái</th>
                  <th class="p-4 text-center">Thao Tác Duyệt</th>
                </tr>
              </thead>
              <tbody>
                @for (ord of orders(); track ord.id) {
                  <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                    <td class="p-4 font-mono font-bold text-white">{{ ord.orderNumber }}</td>
                    <td class="p-4">
                      <p class="font-semibold text-slate-200">{{ ord.shippingName }}</p>
                      <p class="text-[10px] text-slate-400">User #{{ ord.userId }}</p>
                    </td>
                    <td class="p-4 text-slate-400">{{ ord.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="p-4 font-bold text-brand-fuchsia-light font-mono">{{ ord.totalAmount | currency:'VND':'symbol':'1.0-0' }}</td>
                    <td class="p-4 text-slate-300">{{ ord.totalItems }}</td>
                    <td class="p-4 text-slate-300 font-bold">{{ ord.paymentMethod }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider" [ngClass]="statusClass(ord.status)">
                        {{ getStatusText(ord.status) }}
                      </span>
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex flex-wrap items-center justify-center gap-1.5 font-bold text-[10px]">
                        @if (ord.status === 'PENDING') {
                          <button (click)="changeStatus(ord, 'CONFIRMED')" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">Duyệt</button>
                          <button (click)="cancelOrder(ord)" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded">Hủy</button>
                        }
                        @if (ord.status === 'CONFIRMED' || ord.status === 'PAID') {
                          <button (click)="changeStatus(ord, 'PREPARING')" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded">Đóng gói</button>
                        }
                        @if (ord.status === 'PREPARING') {
                          <button (click)="changeStatus(ord, 'SHIPPING')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Giao đi</button>
                        }
                        @if (ord.status === 'SHIPPING') {
                          <button (click)="changeStatus(ord, 'DELIVERED')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Giao Xong</button>
                        }
                        @if (ord.status === 'RETURN_REQUESTED') {
                          <button (click)="confirmReturn(ord)" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded">Duyệt Trả Hàng</button>
                        }
                        @if (ord.status === 'DELIVERED' || ord.status === 'CANCELLED' || ord.status === 'RETURNED') {
                          <span class="text-slate-500 font-normal">N/A</span>
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
              <button (click)="loadMore()" [disabled]="isLoadingMore()"
                class="px-5 py-2 border border-slate-700 text-slate-300 rounded-full text-xs font-semibold hover:bg-slate-800 disabled:opacity-50">
                {{ isLoadingMore() ? 'Đang tải...' : 'Xem thêm' }}
              </button>
            </div>
          }
        }
      </div>

    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly orders = signal<OrderSummaryDTO[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly errorMessage = signal('');
  readonly activeStatus = signal<string>('ALL');
  readonly hasNext = signal(false);
  readonly isExporting = signal(false);

  private currentPage = 0;
  private readonly pageSize = 15;

  readonly filterStatuses = [
    { name: 'Tất Cả', value: 'ALL' },
    { name: 'Chờ Duyệt', value: 'PENDING' },
    { name: 'Xác Nhận', value: 'CONFIRMED' },
    { name: 'Đã Thanh Toán', value: 'PAID' },
    { name: 'Đang Gói', value: 'PREPARING' },
    { name: 'Đang Giao', value: 'SHIPPING' },
    { name: 'Đã Giao', value: 'DELIVERED' },
    { name: 'Yêu Cầu Trả', value: 'RETURN_REQUESTED' },
    { name: 'Đã Hủy', value: 'CANCELLED' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.currentPage = 0;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.fetch(false);
  }

  loadMore(): void {
    this.currentPage += 1;
    this.isLoadingMore.set(true);
    this.fetch(true);
  }

  private fetch(append: boolean): void {
    const status = this.activeStatus() === 'ALL' ? undefined : this.activeStatus();
    this.adminService
      .getAdminOrders({ status, page: this.currentPage, size: this.pageSize })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
          if (res.success && res.data) {
            this.orders.set(append ? [...this.orders(), ...res.data.content] : res.data.content);
            this.hasNext.set(!res.data.last);
          } else {
            this.errorMessage.set(res.message || 'Đã xảy ra lỗi.');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
          this.errorMessage.set(err.message || 'Không thể tải danh sách đơn hàng.');
        },
      });
  }

  selectStatus(status: string): void {
    if (this.activeStatus() === status) return;
    this.activeStatus.set(status);
    this.loadOrders();
  }

  getStatusText(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: 'Chờ duyệt',
      CONFIRMED: 'Đã xác nhận',
      PAID: 'Đã thanh toán',
      PREPARING: 'Đóng gói',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao thành công',
      CANCELLED: 'Đã hủy',
      RETURN_REQUESTED: 'Yêu cầu trả hàng',
      RETURNED: 'Đã trả hàng',
    };
    return map[status];
  }

  statusClass(status: OrderStatus): Record<string, boolean> {
    return {
      'bg-amber-500/20 text-amber-400': status === 'PENDING',
      'bg-blue-500/20 text-blue-400': status === 'CONFIRMED',
      'bg-teal-500/20 text-teal-400': status === 'PAID',
      'bg-cyan-500/20 text-cyan-400': status === 'PREPARING',
      'bg-indigo-500/20 text-indigo-400': status === 'SHIPPING',
      'bg-emerald-500/20 text-emerald-400': status === 'DELIVERED',
      'bg-rose-500/20 text-rose-400': status === 'CANCELLED',
      'bg-orange-500/20 text-orange-400': status === 'RETURN_REQUESTED',
      'bg-purple-500/20 text-purple-400': status === 'RETURNED',
    };
  }

  changeStatus(order: OrderSummaryDTO, nextStatus: OrderStatus): void {
    const note = prompt(`Nhập ghi chú cập nhật trạng thái đơn hàng sang ${this.getStatusText(nextStatus)}:`);
    if (note === null) return;
    this.isLoading.set(true);
    this.adminService.updateOrderStatus(order.orderNumber, nextStatus, note || undefined).subscribe({
      next: () => {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        this.loadOrders();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Cập nhật trạng thái thất bại.');
      },
    });
  }

  cancelOrder(order: OrderSummaryDTO): void {
    const reason = prompt('Nhập lý do hủy đơn hàng:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng!');
      return;
    }
    this.isLoading.set(true);
    this.adminService.adminCancelOrder(order.orderNumber, reason).subscribe({
      next: () => {
        alert('Đã hủy đơn hàng.');
        this.loadOrders();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Hủy đơn hàng thất bại.');
      },
    });
  }

  exportCsv(): void {
    const status = this.activeStatus() === 'ALL' ? undefined : (this.activeStatus() as OrderStatus);
    this.isExporting.set(true);
    this.adminService.exportOrdersCsv({ status }).subscribe({
      next: (blob) => {
        this.isExporting.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isExporting.set(false);
        alert(err?.message || 'Xuất CSV thất bại.');
      },
    });
  }

  confirmReturn(order: OrderSummaryDTO): void {
    if (!confirm(`Xác nhận duyệt yêu cầu trả hàng cho đơn ${order.orderNumber}?`)) return;
    this.isLoading.set(true);
    this.adminService.confirmReturn(order.orderNumber).subscribe({
      next: () => {
        alert('Đã duyệt yêu cầu trả hàng.');
        this.loadOrders();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Duyệt trả hàng thất bại.');
      },
    });
  }
}
