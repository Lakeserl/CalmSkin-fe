import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderDTO, OrderStatus } from '../../../core/models/order.model';

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

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="space-y-4 animate-pulse">
          @for (skel of [1,2]; track skel) {
            <div class="bg-stone-50 rounded-skincare h-36 border"></div>
          }
        </div>
      } @else if (filteredOrders().length === 0) {
        <!-- Empty list -->
        <div class="text-center py-20 bg-white rounded-skincare border p-8 space-y-4 max-w-md mx-auto shadow-sm">
          <svg class="w-12 h-12 text-brand-fuchsia-light mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <h3 class="text-base font-semibold text-brand-charcoal">Không tìm thấy đơn hàng nào</h3>
          <p class="text-xs text-brand-muted">Bạn chưa thực hiện giao dịch nào ở trạng thái này.</p>
          <a routerLink="/products" class="inline-block px-6 py-2 btn-fuchsia-glow rounded-full text-xs font-semibold">Mua Sắm Ngay</a>
        </div>
      } @else {
        
        <!-- Orders List -->
        <div class="space-y-6">
          @for (order of filteredOrders(); track order.id) {
            <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 shadow-sm p-5 space-y-4 transition-all hover:shadow-md animate-fade-in">
              
              <!-- Order Header info -->
              <div class="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
                <div class="flex items-center space-x-2 text-xs">
                  <span class="text-brand-muted">Mã đơn:</span>
                  <strong class="text-brand-charcoal font-mono">{{ order.orderNumber }}</strong>
                  <span class="text-[10px] text-brand-muted">({{ order.createdAt | date:'dd/MM/yyyy HH:mm' }})</span>
                </div>
                
                <!-- Status Badge -->
                <span class="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider"
                  [ngClass]="{
                    'bg-amber-100 text-amber-700': order.status === 'PENDING',
                    'bg-blue-100 text-blue-700': order.status === 'CONFIRMED',
                    'bg-cyan-100 text-cyan-700': order.status === 'PREPARING',
                    'bg-indigo-100 text-indigo-700': order.status === 'SHIPPING',
                    'bg-emerald-100 text-emerald-700': order.status === 'DELIVERED',
                    'bg-red-100 text-red-700': order.status === 'CANCELLED',
                    'bg-purple-100 text-purple-700': order.status === 'RETURNED'
                  }"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </div>

              <!-- Item Preview (Displays first item) -->
              @if (order.items && order.items.length > 0) {
                <div class="flex items-center space-x-4 text-xs">
                  <img [src]="order.items[0].primaryImageUrl || 'assets/placeholder.jpg'" class="w-14 h-14 object-cover rounded-lg border bg-brand-champagne shrink-0" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-brand-charcoal truncate">{{ order.items[0].productName }}</h4>
                    @if (order.items[0].variantName) {
                      <p class="text-[10px] text-brand-muted mt-0.5">{{ order.items[0].variantName }}</p>
                    }
                    <p class="text-[10px] text-brand-muted mt-0.5">Số lượng: {{ order.items[0].quantity }} x {{ order.items[0].price | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                  @if (order.items.length > 1) {
                    <span class="text-[10px] text-brand-muted bg-stone-100 px-2 py-1 rounded shrink-0">+{{ order.items.length - 1 }} sản phẩm khác</span>
                  }
                </div>
              }

              <!-- Footer total price & CTA actions -->
              <div class="flex flex-wrap items-center justify-between border-t pt-3 gap-3">
                <div class="text-xs">
                  <span class="text-brand-muted">Tổng cộng (gồm ship):</span>
                  <strong class="text-brand-fuchsia-dark text-sm sm:text-base font-bold ml-1">{{ order.totalAmount | currency:'VND':'symbol':'1.0-0' }}</strong>
                </div>

                <div class="flex items-center space-x-2 text-xs font-semibold">
                  @if (order.status === 'PENDING') {
                    <button 
                      (click)="triggerCancel(order.orderNumber)"
                      class="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      Hủy Đơn Hàng
                    </button>
                  }
                  <a 
                    [routerLink]="['/orders', order.orderNumber]"
                    class="px-4 py-2 btn-fuchsia-glow rounded-full text-center"
                  >
                    Xem Chi Tiết
                  </a>
                </div>
              </div>

            </div>
          }
        </div>

      }

    </div>
  `
})
export class HistoryComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<OrderDTO[]>([]);
  readonly filteredOrders = signal<OrderDTO[]>([]);
  readonly isLoading = signal(false);
  readonly activeTab = signal<string>('ALL');

  readonly statusTabs = [
    { name: 'Tất cả đơn', value: 'ALL' },
    { name: 'Chờ duyệt', value: 'PENDING' },
    { name: 'Đã xác nhận', value: 'CONFIRMED' },
    { name: 'Đóng gói', value: 'PREPARING' },
    { name: 'Đang giao', value: 'SHIPPING' },
    { name: 'Đã giao', value: 'DELIVERED' },
    { name: 'Đã hủy', value: 'CANCELLED' }
  ];

  // Mock list for empty db or testing UI
  private readonly mockOrders: OrderDTO[] = [
    {
      id: 1001,
      orderNumber: 'ORD-20260520-7492',
      userId: 1,
      shippingName: 'Khánh Linh',
      shippingPhone: '0987654321',
      shippingProvince: 'Hồ Chí Minh',
      shippingDistrict: 'Quận 1',
      shippingWard: 'Bến Nghé',
      shippingStreet: '15 Lê Lợi',
      subtotal: 299000,
      discountAmount: 0,
      shippingFee: 30000,
      pointsUsed: 0,
      pointsAmount: 0,
      totalAmount: 329000,
      status: 'PENDING',
      paymentMethod: 'COD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 111,
          productId: 1,
          productName: 'Tinh chất Trị Mụn BHA 2% Salicylic Acid Acne Clearing Serum',
          productSlug: 'tinh-chat-tri-mun-bha-2-percent',
          primaryImageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
          variantName: 'Dung tích 30ml',
          quantity: 1,
          price: 299000,
          totalPrice: 299000
        }
      ],
      statusHistory: []
    },
    {
      id: 1002,
      orderNumber: 'ORD-20260519-2150',
      userId: 1,
      shippingName: 'Khánh Linh',
      shippingPhone: '0987654321',
      shippingProvince: 'Hồ Chí Minh',
      shippingDistrict: 'Quận 1',
      shippingWard: 'Bến Nghé',
      shippingStreet: '15 Lê Lợi',
      subtotal: 505000,
      discountAmount: 0,
      shippingFee: 0,
      pointsUsed: 0,
      pointsAmount: 0,
      totalAmount: 505000,
      status: 'DELIVERED',
      paymentMethod: 'VNPAY',
      createdAt: '2026-05-19T14:30:00Z',
      updatedAt: '2026-05-20T10:00:00Z',
      items: [
        {
          id: 112,
          productId: 2,
          productName: 'Kem dưỡng Phục Hồi Làm Dịu Da Tổn Thương Panthenol B5 Cream',
          productSlug: 'kem-duong-phuc-hoi-b5-cream',
          primaryImageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=200',
          variantName: 'Tuýp 50ml',
          quantity: 1,
          price: 320000,
          totalPrice: 320000
        },
        {
          id: 113,
          productId: 4,
          productName: 'Sữa Rửa Mặt Tạo Bọt Dịu Nhẹ Trà Xanh Hydrating Green Tea Cleanser',
          productSlug: 'sua-rua-mat-tao-bot-tra-xanh',
          primaryImageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200',
          variantName: 'Chai 150ml',
          quantity: 1,
          price: 185000,
          totalPrice: 185000
        }
      ],
      statusHistory: []
    }
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data && res.data.content && res.data.content.length > 0) {
          this.orders.set(res.data.content);
        } else {
          this.orders.set(this.mockOrders);
        }
        this.filterOrdersList();
      },
      error: () => {
        this.isLoading.set(false);
        this.orders.set(this.mockOrders);
        this.filterOrdersList();
      }
    });
  }

  filterOrdersList() {
    const tab = this.activeTab();
    if (tab === 'ALL') {
      this.filteredOrders.set(this.orders());
    } else {
      const filtered = this.orders().filter(o => o.status === tab);
      this.filteredOrders.set(filtered);
    }
  }

  selectTab(tabValue: string) {
    this.activeTab.set(tabValue);
    this.filterOrdersList();
  }

  getStatusText(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDING: 'Chờ duyệt',
      CONFIRMED: 'Đã xác nhận',
      PREPARING: 'Đóng gói',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao thành công',
      CANCELLED: 'Đã hủy',
      RETURNED: 'Đã trả hàng'
    };
    return map[status];
  }

  triggerCancel(orderNumber: string) {
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
      }
    });
  }
}
