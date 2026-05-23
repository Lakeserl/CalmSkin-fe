import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderStatus, OrderSummaryDTO } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 class="text-3xl font-serif text-brand-charcoal mb-8 border-b pb-4">Đơn Hàng Đã Mua</h1>

      <!-- Tabs Selector -->
      <div class="flex border-b border-brand-fuchsia-light/20 overflow-x-auto space-x-4 mb-6 scrollbar-hide text-xs sm:text-sm font-semibold shrink-0">
        @for (tab of statusTabs; track tab.value) {
          <button
            (click)="selectTab(tab.value)"
            [class.border-brand-fuchsia]="activeTab() === tab.value"
            [class.text-brand-fuchsia-dark]="activeTab() === tab.value"
            class="pb-3 border-b-2 border-transparent text-brand-muted hover:text-brand-charcoal whitespace-nowrap"
          >
            {{ tab.name }}
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="space-y-4 animate-pulse">
          @for (skel of [1,2,3]; track skel) {
            <div class="bg-stone-50 rounded-skincare h-28 border"></div>
          }
        </div>
      } @else if (errorMessage()) {
        <div class="text-center py-16 bg-red-50 border border-red-100 rounded-skincare p-8 max-w-md mx-auto space-y-3">
          <h3 class="text-sm font-semibold text-red-700">Không tải được danh sách đơn hàng</h3>
          <p class="text-xs text-red-600">{{ errorMessage() }}</p>
          <button (click)="loadOrders()" class="px-5 py-2 btn-fuchsia-glow rounded-full text-xs font-semibold">Thử lại</button>
        </div>
      } @else if (orders().length === 0) {
        <div class="text-center py-20 bg-white rounded-skincare border p-8 space-y-4 max-w-md mx-auto shadow-sm">
          <svg class="w-12 h-12 text-brand-fuchsia-light mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <h3 class="text-base font-semibold text-brand-charcoal">Không tìm thấy đơn hàng nào</h3>
          <p class="text-xs text-brand-muted">Bạn chưa thực hiện giao dịch nào ở trạng thái này.</p>
          <a routerLink="/products" class="inline-block px-6 py-2 btn-fuchsia-glow rounded-full text-xs font-semibold">Mua Sắm Ngay</a>
        </div>
      } @else {

        <div class="space-y-5">
          @for (order of orders(); track order.id) {
            <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm p-5 space-y-4 transition-all hover:shadow-md animate-fade-in">

              <div class="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
                <div class="flex items-center space-x-2 text-xs">
                  <span class="text-brand-muted">Mã đơn:</span>
                  <strong class="text-brand-charcoal font-mono">{{ order.orderNumber }}</strong>
                  <span class="text-[10px] text-brand-muted">({{ order.createdAt | date:'dd/MM/yyyy HH:mm' }})</span>
                </div>
                <span class="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider"
                  [ngClass]="statusClass(order.status)"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div class="space-y-1">
                  <p class="text-brand-charcoal"><span class="text-brand-muted">Người nhận:</span> <strong>{{ order.shippingName }}</strong></p>
                  <p class="text-brand-muted">{{ order.totalItems }} sản phẩm · Thanh toán: {{ order.paymentMethod }}</p>
                </div>
                <div class="text-right">
                  <span class="text-brand-muted">Tổng cộng:</span>
                  <strong class="text-brand-fuchsia-dark text-sm sm:text-base font-bold ml-1">{{ order.totalAmount | currency:'VND':'symbol':'1.0-0' }}</strong>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2 border-t pt-3 text-xs font-semibold">
                @if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
                  <button
                    (click)="triggerCancel(order.orderNumber)"
                    class="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    Hủy Đơn Hàng
                  </button>
                }
                <a [routerLink]="['/orders', order.orderNumber]" class="px-4 py-2 btn-fuchsia-glow rounded-full text-center">
                  Xem Chi Tiết
                </a>
              </div>

            </div>
          }
        </div>

        @if (hasNext()) {
          <div class="text-center mt-6">
            <button (click)="loadMore()" [disabled]="isLoadingMore()"
              class="px-6 py-2.5 border border-brand-fuchsia text-brand-fuchsia rounded-full text-xs font-semibold hover:bg-brand-rosewater transition-all disabled:opacity-50">
              {{ isLoadingMore() ? 'Đang tải...' : 'Xem thêm đơn hàng' }}
            </button>
          </div>
        }

      }
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<OrderSummaryDTO[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly errorMessage = signal('');
  readonly activeTab = signal<string>('ALL');
  readonly hasNext = signal(false);

  private currentPage = 0;
  private readonly pageSize = 10;

  readonly statusTabs = [
    { name: 'Tất cả đơn', value: 'ALL' },
    { name: 'Chờ duyệt', value: 'PENDING' },
    { name: 'Đã xác nhận', value: 'CONFIRMED' },
    { name: 'Đã thanh toán', value: 'PAID' },
    { name: 'Đóng gói', value: 'PREPARING' },
    { name: 'Đang giao', value: 'SHIPPING' },
    { name: 'Đã giao', value: 'DELIVERED' },
    { name: 'Đã hủy', value: 'CANCELLED' },
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
    const status = this.activeTab() === 'ALL' ? undefined : this.activeTab();
    this.orderService.getUserOrders(status, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        if (res.success && res.data) {
          const page = res.data;
          this.orders.set(append ? [...this.orders(), ...page.content] : page.content);
          this.hasNext.set(!page.last);
        } else {
          this.errorMessage.set(res.message || 'Đã xảy ra lỗi.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        this.errorMessage.set(err.message || 'Không thể kết nối tới máy chủ.');
      },
    });
  }

  selectTab(tabValue: string): void {
    if (this.activeTab() === tabValue) return;
    this.activeTab.set(tabValue);
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
      'bg-amber-100 text-amber-700': status === 'PENDING',
      'bg-blue-100 text-blue-700': status === 'CONFIRMED',
      'bg-teal-100 text-teal-700': status === 'PAID',
      'bg-cyan-100 text-cyan-700': status === 'PREPARING',
      'bg-indigo-100 text-indigo-700': status === 'SHIPPING',
      'bg-emerald-100 text-emerald-700': status === 'DELIVERED',
      'bg-red-100 text-red-700': status === 'CANCELLED',
      'bg-orange-100 text-orange-700': status === 'RETURN_REQUESTED',
      'bg-purple-100 text-purple-700': status === 'RETURNED',
    };
  }

  triggerCancel(orderNumber: string): void {
    const reason = prompt('Nhập lý do bạn muốn hủy đơn hàng này:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lòng cung cấp lý do hủy đơn hàng!');
      return;
    }
    this.isLoading.set(true);
    this.orderService.cancelOrder(orderNumber, reason).subscribe({
      next: () => {
        alert('Hủy đơn hàng thành công.');
        this.loadOrders();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Hủy đơn hàng thất bại. Đơn hàng có thể đã được giao.');
      },
    });
  }
}
