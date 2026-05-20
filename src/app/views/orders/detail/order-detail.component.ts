import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderDTO, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <!-- Back button -->
      <a routerLink="/orders" class="inline-flex items-center space-x-1 text-xs text-brand-fuchsia font-semibold hover:underline mb-6">
        <span>← Quay lại lịch sử đơn</span>
      </a>

      @if (isLoading()) {
        <div class="animate-pulse space-y-6">
          <div class="h-20 bg-stone-50 border rounded-skincare"></div>
          <div class="h-40 bg-stone-50 border rounded-skincare"></div>
        </div>
      } @else if (!order()) {
        <div class="text-center py-20 bg-white border rounded-skincare">
          <p class="text-brand-muted text-sm">Không tìm thấy chi tiết của đơn hàng này.</p>
        </div>
      } @else {
        
        <div class="space-y-8 animate-fade-in">
          
          <!-- Header Card -->
          <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="space-y-1">
              <span class="text-[9px] font-bold text-brand-fuchsia uppercase tracking-wider">Mã Theo Dõi Đơn Hàng</span>
              <h1 class="text-xl font-mono font-bold text-brand-charcoal">{{ order()?.orderNumber }}</h1>
              <p class="text-xs text-brand-muted">Ngày đặt: {{ order()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            
            <div class="flex flex-col sm:items-end">
              <span class="text-xs text-brand-muted">Phương thức: <strong class="text-brand-charcoal">{{ order()?.paymentMethod }}</strong></span>
              <span class="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mt-1.5"
                [ngClass]="{
                  'bg-amber-100 text-amber-700': order()?.status === 'PENDING',
                  'bg-blue-100 text-blue-700': order()?.status === 'CONFIRMED',
                  'bg-cyan-100 text-cyan-700': order()?.status === 'PREPARING',
                  'bg-indigo-100 text-indigo-700': order()?.status === 'SHIPPING',
                  'bg-emerald-100 text-emerald-700': order()?.status === 'DELIVERED',
                  'bg-red-100 text-red-700': order()?.status === 'CANCELLED',
                  'bg-purple-100 text-purple-700': order()?.status === 'RETURNED'
                }"
              >
                {{ getStatusText(order()!.status) }}
              </span>
            </div>
          </div>

          <!-- GRAPHICAL TIMELINE TRACKER -->
          @if (order()?.status !== 'CANCELLED' && order()?.status !== 'RETURNED') {
            <div class="bg-white p-6 sm:p-8 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm">
              <h2 class="text-sm font-semibold text-brand-charcoal mb-6 text-center uppercase tracking-wider">Hành Trình Giao Mỹ Phẩm</h2>
              
              <!-- Horizontal steps (Desktop) / Vertical (Mobile) -->
              <div class="relative flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:px-10">
                
                <!-- Background track bar -->
                <div class="absolute top-2.5 left-0 right-0 h-1 bg-stone-100 hidden md:block z-0"></div>
                <div class="absolute top-2.5 left-10 right-10 h-1 bg-brand-fuchsia/40 hidden md:block z-0 transition-all duration-300"
                  [ngStyle]="{ 'width': getTimelineWidth() }"
                ></div>

                <!-- Steps -->
                @for (step of timelineSteps; track step.status; let i = $index) {
                  <div class="flex flex-row md:flex-col items-center z-10 w-full md:w-auto space-x-4 md:space-x-0">
                    <!-- Icon circle -->
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border transition-all duration-300"
                      [ngClass]="{
                        'bg-brand-fuchsia text-white border-brand-fuchsia animate-pulse-glow': isStepActive(step.status),
                        'bg-brand-fuchsia-light/30 text-brand-fuchsia-dark border-brand-fuchsia-light': isStepPassed(step.status),
                        'bg-white text-stone-300 border-stone-200': !isStepActive(step.status) && !isStepPassed(step.status)
                      }"
                    >
                      @if (isStepPassed(step.status)) {
                        <!-- Checkmark icon -->
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"></path></svg>
                      } @else {
                        {{ i + 1 }}
                      }
                    </div>
                    
                    <!-- Label details -->
                    <div class="text-left md:text-center md:mt-2">
                      <p class="font-semibold text-xs text-brand-charcoal">{{ step.label }}</p>
                      @if (getStepTime(step.status)) {
                        <p class="text-[9px] text-brand-muted mt-0.5">{{ getStepTime(step.status) | date:'dd/MM HH:mm' }}</p>
                      }
                    </div>
                  </div>
                }

              </div>
            </div>
          }

          <!-- Delivery Address & Receiver details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="bg-white p-5 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-2 text-xs">
              <h3 class="font-bold text-brand-charcoal uppercase tracking-wider text-[10px]">Người Nhận Hàng</h3>
              <p class="font-semibold text-brand-charcoal">{{ order()?.shippingName }}</p>
              <p class="text-brand-muted">SĐT: {{ order()?.shippingPhone }}</p>
              <p class="text-brand-muted">Ghi chú: {{ order()?.note || 'Không có ghi chú.' }}</p>
            </div>

            <div class="bg-white p-5 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-2 text-xs">
              <h3 class="font-bold text-brand-charcoal uppercase tracking-wider text-[10px]">Địa Chỉ Nhận Hàng</h3>
              <p class="text-brand-muted leading-relaxed">
                {{ order()?.shippingStreet }}, <br/>
                Phường {{ order()?.shippingWard }}, Quận {{ order()?.shippingDistrict }}, <br/>
                Thành phố {{ order()?.shippingProvince }}
              </p>
            </div>

          </div>

          <!-- Items list & invoice summary -->
          <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 p-6 space-y-4 shadow-sm text-xs">
            <h3 class="font-bold text-brand-charcoal uppercase tracking-wider text-[10px] border-b pb-2">Danh sách mỹ phẩm đặt mua</h3>
            
            <div class="space-y-3">
              @for (item of order()?.items; track item.id) {
                <div class="flex items-center space-x-3">
                  <img [src]="item.primaryImageUrl || 'assets/placeholder.jpg'" class="w-12 h-12 object-cover rounded border bg-brand-champagne" />
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/products', item.productSlug]" class="font-semibold text-brand-charcoal hover:underline truncate block">{{ item.productName }}</a>
                    @if (item.variantName) {
                      <p class="text-[9px] text-brand-muted mt-0.5">{{ item.variantName }}</p>
                    }
                    <p class="text-brand-muted mt-0.5">Đơn giá: {{ item.price | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="font-semibold text-brand-charcoal">{{ item.quantity }} x</p>
                    <p class="font-bold text-brand-fuchsia-dark">{{ item.totalPrice | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                </div>
              }
            </div>

            <div class="border-t pt-3 space-y-2">
              <div class="flex justify-between text-brand-muted">
                <span>Cộng tiền hàng:</span>
                <span>{{ order()?.subtotal | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between text-brand-muted">
                <span>Phí vận chuyển:</span>
                <span>{{ order()?.shippingFee === 0 ? 'Miễn phí' : (order()?.shippingFee | currency:'VND':'symbol':'1.0-0') }}</span>
              </div>
              @if (order()?.discountAmount && order()!.discountAmount > 0) {
                <div class="flex justify-between text-emerald-600 font-medium">
                  <span>Tiết kiệm giá KM:</span>
                  <span>-{{ order()?.discountAmount | currency:'VND':'symbol':'1.0-0' }}</span>
                </div>
              }
              @if (order()?.pointsAmount && order()!.pointsAmount > 0) {
                <div class="flex justify-between text-emerald-600 font-medium">
                  <span>Khấu trừ xu tích lũy ({{ order()?.pointsUsed }} xu):</span>
                  <span>-{{ order()?.pointsAmount | currency:'VND':'symbol':'1.0-0' }}</span>
                </div>
              }
              <div class="border-t pt-3 flex justify-between text-sm font-bold text-brand-charcoal">
                <span>Tổng số tiền thanh toán:</span>
                <span class="text-brand-fuchsia-dark text-base">{{ order()?.totalAmount | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <!-- Customer actions for returns -->
            <div class="flex items-center justify-end space-x-2 pt-2 border-t font-semibold">
              @if (order()?.status === 'PENDING') {
                <button (click)="triggerCancel()" class="px-5 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-full transition-all">
                  Hủy đơn hàng này
                </button>
              }
              @if (order()?.status === 'DELIVERED') {
                <button (click)="triggerReturn()" class="px-5 py-2.5 border border-brand-fuchsia text-brand-fuchsia hover:bg-brand-rosewater rounded-full transition-all">
                  Yêu Cầu Hoàn Tiền / Trả Hàng
                </button>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);

  readonly order = signal<OrderDTO | null>(null);
  readonly isLoading = signal(false);

  readonly timelineSteps = [
    { label: 'Chờ duyệt', status: 'PENDING' },
    { label: 'Xác nhận', status: 'CONFIRMED' },
    { label: 'Đóng gói', status: 'PREPARING' },
    { label: 'Đang giao', status: 'SHIPPING' },
    { label: 'Đã giao', status: 'DELIVERED' }
  ];

  // Mock list matching orderNumber
  private readonly mockOrderDetail: OrderDTO = {
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
    statusHistory: [
      { id: 991, status: 'PENDING', note: 'Đơn hàng mới được thiết lập.', createdAt: new Date().toISOString() }
    ]
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderNumber = params['orderNumber'];
      if (orderNumber) {
        this.loadOrderDetail(orderNumber);
      }
    });
  }

  loadOrderDetail(orderNumber: string) {
    this.isLoading.set(true);
    this.orderService.getOrderDetail(orderNumber).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.order.set(res.data);
        } else {
          this.order.set({ ...this.mockOrderDetail, orderNumber });
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.order.set({ ...this.mockOrderDetail, orderNumber });
      }
    });
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

  isStepActive(status: string): boolean {
    return this.order()?.status === status;
  }

  isStepPassed(status: string): boolean {
    const currentStatus = this.order()?.status;
    if (!currentStatus) return false;

    const sequence = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'];
    const activeIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(status);
    
    return stepIndex < activeIndex && stepIndex > -1;
  }

  getTimelineWidth(): string {
    const currentStatus = this.order()?.status;
    if (!currentStatus) return '0%';

    const sequence = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'];
    const activeIndex = sequence.indexOf(currentStatus);
    if (activeIndex <= 0) return '0%';
    
    // Width mapping percentage
    const pct = (activeIndex / (sequence.length - 1)) * 100;
    return `${pct}%`;
  }

  getStepTime(status: string): string | undefined {
    const ord = this.order();
    if (!ord) return undefined;

    if (status === 'PENDING') return ord.createdAt;
    if (status === 'CONFIRMED') return ord.confirmedAt || ord.createdAt;
    if (status === 'PREPARING') return ord.preparingAt;
    if (status === 'SHIPPING') return ord.shippedAt;
    if (status === 'DELIVERED') return ord.deliveredAt;
    return undefined;
  }

  triggerCancel() {
    const ord = this.order();
    if (!ord) return;

    const reason = prompt('Nhập lý do bạn muốn hủy đơn hàng:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lý do hủy đơn hàng!');
      return;
    }

    this.isLoading.set(true);
    this.orderService.cancelOrder(ord.orderNumber, reason).subscribe({
      next: () => {
        alert('Hủy đơn hàng thành công.');
        this.loadOrderDetail(ord.orderNumber);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Hủy đơn hàng thất bại.');
      }
    });
  }

  triggerReturn() {
    const ord = this.order();
    if (!ord) return;

    const reason = prompt('Nhập lý do hoàn trả hàng và hoàn tiền:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do trả hàng!');
      return;
    }

    this.isLoading.set(true);
    this.orderService.requestReturn(ord.orderNumber, { reason }).subscribe({
      next: () => {
        alert('Yêu cầu trả hàng hoàn tiền đã được gửi! CalmSKIN sẽ liên hệ lại trong vòng 24H để xử lý hoàn tiền.');
        this.loadOrderDetail(ord.orderNumber);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Yêu cầu trả hàng thất bại.');
      }
    });
  }
}
