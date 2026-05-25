import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { OrderDTO, OrderStatus } from '../../../core/models/order.model';
import { ShipmentDTO } from '../../../core/models/shipment.model';

interface TimelineStep {
  label: string;
  rank: number;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <a routerLink="/orders" class="inline-flex items-center space-x-1 text-xs text-brand-fuchsia font-semibold hover:underline mb-6">
        <span>← Quay lại lịch sử đơn</span>
      </a>

      @if (isLoading()) {
        <div class="animate-pulse space-y-6">
          <div class="h-20 bg-stone-50 border rounded-skincare"></div>
          <div class="h-40 bg-stone-50 border rounded-skincare"></div>
        </div>
      } @else if (!order()) {
        <div class="text-center py-20 bg-white border rounded-skincare space-y-2">
          <p class="text-brand-charcoal text-sm font-semibold">Không tìm thấy chi tiết của đơn hàng này.</p>
          @if (errorMessage()) {
            <p class="text-xs text-brand-muted">{{ errorMessage() }}</p>
          }
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
                [ngClass]="statusClass(order()!.status)"
              >
                {{ getStatusText(order()!.status) }}
              </span>
            </div>
          </div>

          <!-- TIMELINE TRACKER -->
          @if (!isTerminalBad(order()!.status)) {
            <div class="bg-white p-6 sm:p-8 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm">
              <h2 class="text-sm font-semibold text-brand-charcoal mb-6 text-center uppercase tracking-wider">Hành Trình Giao Mỹ Phẩm</h2>

              <div class="relative flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:px-10">
                <div class="absolute top-2.5 left-0 right-0 h-1 bg-stone-100 hidden md:block z-0"></div>
                <div class="absolute top-2.5 left-10 right-10 h-1 bg-brand-fuchsia/40 hidden md:block z-0 transition-all duration-300"
                  [ngStyle]="{ 'width': getTimelineWidth() }"
                ></div>

                @for (step of timelineSteps; track step.rank; let i = $index) {
                  <div class="flex flex-row md:flex-col items-center z-10 w-full md:w-auto space-x-4 md:space-x-0">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border transition-all duration-300"
                      [ngClass]="{
                        'bg-brand-fuchsia text-white border-brand-fuchsia animate-pulse-glow': isStepActive(step),
                        'bg-brand-fuchsia-light/30 text-brand-fuchsia-dark border-brand-fuchsia-light': isStepPassed(step),
                        'bg-white text-stone-300 border-stone-200': !isStepActive(step) && !isStepPassed(step)
                      }"
                    >
                      @if (isStepPassed(step)) {
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"></path></svg>
                      } @else {
                        {{ i + 1 }}
                      }
                    </div>
                    <div class="text-left md:text-center md:mt-2">
                      <p class="font-semibold text-xs text-brand-charcoal">{{ step.label }}</p>
                      @if (getStepTime(step.rank)) {
                        <p class="text-[9px] text-brand-muted mt-0.5">{{ getStepTime(step.rank) | date:'dd/MM HH:mm' }}</p>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (order()?.cancelReason) {
             <div class="bg-red-50 border border-red-100 rounded-skincare p-4 text-xs text-red-700">
               <strong>Lý do hủy/hoàn:</strong> {{ order()?.cancelReason }}
             </div>
           }

           <!-- SHIPMENT CARRIER TRACKING EVENTS -->
           @if (shipment(); as ship) {
             <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-4">
               <div class="flex justify-between items-center border-b pb-3">
                 <h3 class="font-bold text-brand-charcoal uppercase tracking-wider text-[10px] flex items-center">
                   🚚 Chi Tiết Vận Chuyển ({{ ship.provider }})
                 </h3>
                 @if (ship.trackingNumber) {
                   <span class="text-xs font-mono bg-stone-50 border px-2.5 py-1 rounded text-brand-charcoal">
                     Mã vận đơn: <strong>{{ ship.trackingNumber }}</strong>
                   </span>
                 }
               </div>

               @if (ship.trackingEvents && ship.trackingEvents.length > 0) {
                 <!-- Vertical Timeline of Tracking Events -->
                 <div class="relative pl-6 border-l-2 border-brand-fuchsia/20 space-y-6 text-xs ml-2 py-1">
                   @for (event of ship.trackingEvents; track $index; let first = $first) {
                     <div class="relative">
                       <!-- Small dot on line -->
                       <div class="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border border-white transition-all shadow"
                         [ngClass]="first ? 'bg-brand-fuchsia scale-125 ring-4 ring-brand-fuchsia/20' : 'bg-brand-muted'"
                       ></div>
                       
                       <div class="space-y-1">
                         <div class="flex items-center space-x-2">
                           <span class="font-bold text-brand-charcoal">{{ getShipmentStatusText(event.status) }}</span>
                           @if (event.location) {
                             <span class="text-[10px] bg-stone-100 text-brand-muted px-1.5 py-0.5 rounded font-medium">{{ event.location }}</span>
                           }
                         </div>
                         @if (event.description) {
                           <p class="text-brand-muted font-medium leading-relaxed">{{ event.description }}</p>
                         }
                         <p class="text-[9px] text-brand-muted/70">{{ event.occurredAt | date:'dd/MM/yyyy HH:mm' }}</p>
                       </div>
                     </div>
                   }
                 </div>
               } @else {
                 <p class="text-xs text-brand-muted italic">Đang chuẩn bị thông tin vận chuyển...</p>
               }
             </div>
           }

          <!-- Receiver + Address -->
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

          <!-- Payment info -->
          @if (order()?.paymentInfo; as pay) {
            <div class="bg-white p-5 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm text-xs space-y-2">
              <h3 class="font-bold text-brand-charcoal uppercase tracking-wider text-[10px] border-b pb-2">Thông Tin Thanh Toán</h3>
              <div class="flex justify-between"><span class="text-brand-muted">Phương thức:</span><strong class="text-brand-charcoal">{{ pay.paymentMethod }}</strong></div>
              <div class="flex justify-between">
                <span class="text-brand-muted">Trạng thái:</span>
                <strong [ngClass]="pay.paymentStatus === 'COMPLETED' ? 'text-emerald-600' : (pay.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-amber-600')">
                  {{ getPaymentStatusText(pay.paymentStatus) }}
                </strong>
              </div>
              @if (pay.transactionId) {
                <div class="flex justify-between"><span class="text-brand-muted">Mã giao dịch:</span><span class="font-mono text-brand-charcoal">{{ pay.transactionId }}</span></div>
              }
              @if (pay.paidAt) {
                <div class="flex justify-between"><span class="text-brand-muted">Thời điểm thanh toán:</span><span class="text-brand-charcoal">{{ pay.paidAt | date:'dd/MM/yyyy HH:mm' }}</span></div>
              }
              @if (pay.refundAmount && pay.refundAmount > 0) {
                <div class="flex justify-between text-purple-600 font-medium"><span>Đã hoàn tiền:</span><span>{{ pay.refundAmount | currency:'VND':'symbol':'1.0-0' }}</span></div>
              }
            </div>
          }

          <!-- Items + invoice -->
          <div class="bg-white rounded-skincare border border-brand-fuchsia-light/10 p-6 space-y-4 shadow-sm text-xs">
            <h3 class="font-bold text-brand-charcoal uppercase tracking-wider text-[10px] border-b pb-2">Danh sách mỹ phẩm đặt mua</h3>

            <div class="space-y-3">
              @for (item of order()?.items; track item.id) {
                <div class="flex items-center space-x-3">
                  <img [src]="item.productImageUrl || 'assets/placeholder.jpg'" class="w-12 h-12 object-cover rounded border bg-brand-champagne" />
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-brand-charcoal truncate">{{ item.productName }}</p>
                    @if (item.variantName) {
                      <p class="text-[9px] text-brand-muted mt-0.5">{{ item.variantName }}</p>
                    }
                    <p class="text-brand-muted mt-0.5">Đơn giá: {{ item.unitPrice | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="font-semibold text-brand-charcoal">{{ item.quantity }} x</p>
                    <p class="font-bold text-brand-fuchsia-dark">{{ item.subtotal | currency:'VND':'symbol':'1.0-0' }}</p>
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
              @if (order()!.discountAmount > 0) {
                <div class="flex justify-between text-emerald-600 font-medium">
                  <span>Tiết kiệm giá KM:</span>
                  <span>-{{ order()?.discountAmount | currency:'VND':'symbol':'1.0-0' }}</span>
                </div>
              }
              @if (order()!.pointsAmount > 0) {
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

            <!-- Customer actions -->
            <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t font-semibold">
              @if (canPayOnline()) {
                <button (click)="payNow()" [disabled]="isProcessing()"
                  class="px-5 py-2.5 btn-fuchsia-glow rounded-full transition-all disabled:opacity-50">
                  {{ isProcessing() ? 'Đang xử lý...' : 'Thanh Toán Ngay' }}
                </button>
              }
              @if (canCancel()) {
                <button (click)="triggerCancel()" [disabled]="isProcessing()"
                  class="px-5 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-full transition-all disabled:opacity-50">
                  Hủy đơn hàng này
                </button>
              }
              @if (order()?.status === 'DELIVERED') {
                <button (click)="triggerReturn()" [disabled]="isProcessing()"
                  class="px-5 py-2.5 border border-brand-fuchsia text-brand-fuchsia hover:bg-brand-rosewater rounded-full transition-all disabled:opacity-50">
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
  private readonly paymentService = inject(PaymentService);
  private readonly shipmentService = inject(ShipmentService);
  private readonly route = inject(ActivatedRoute);

  readonly order = signal<OrderDTO | null>(null);
  readonly shipment = signal<ShipmentDTO | null>(null);
  readonly isLoading = signal(false);
  readonly isProcessing = signal(false);
  readonly errorMessage = signal('');

  readonly timelineSteps: TimelineStep[] = [
    { label: 'Chờ duyệt', rank: 0 },
    { label: 'Xác nhận', rank: 1 },
    { label: 'Đóng gói', rank: 2 },
    { label: 'Đang giao', rank: 3 },
    { label: 'Đã giao', rank: 4 },
  ];

  // Maps order status to a position on the 5-step timeline.
  private readonly statusRank: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PAID: 1,
    PREPARING: 2,
    SHIPPING: 3,
    DELIVERED: 4,
    CANCELLED: -1,
    RETURN_REQUESTED: 4,
    RETURNED: 4,
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderNumber = params['orderNumber'];
      if (orderNumber) {
        this.loadOrderDetail(orderNumber);
      }
    });
  }

  loadOrderDetail(orderNumber: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.orderService.getOrderDetail(orderNumber).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.order.set(res.data);
          const status = res.data.status;
          if (status !== 'PENDING' && status !== 'CANCELLED') {
            this.loadShipmentDetail(orderNumber);
          } else {
            this.shipment.set(null);
          }
        } else {
          this.order.set(null);
          this.errorMessage.set(res.message || '');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.order.set(null);
        this.errorMessage.set(err.message || '');
      },
    });
  }

  loadShipmentDetail(orderNumber: string): void {
    this.shipmentService.getShipmentByOrder(orderNumber).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (res.data.trackingEvents) {
            res.data.trackingEvents.sort(
              (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
            );
          }
          this.shipment.set(res.data);
        } else {
          this.shipment.set(null);
        }
      },
      error: () => this.shipment.set(null),
    });
  }

  isTerminalBad(status: OrderStatus): boolean {
    return status === 'CANCELLED' || status === 'RETURNED' || status === 'RETURN_REQUESTED';
  }

  canCancel(): boolean {
    const s = this.order()?.status;
    return s === 'PENDING' || s === 'CONFIRMED';
  }

  canPayOnline(): boolean {
    const ord = this.order();
    if (!ord) return false;
    const isOnline = ord.paymentMethod === 'VNPAY' || ord.paymentMethod === 'MOMO';
    const unpaid = !ord.paymentInfo || ord.paymentInfo.paymentStatus !== 'COMPLETED';
    return isOnline && unpaid && (ord.status === 'PENDING' || ord.status === 'CONFIRMED');
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

  getPaymentStatusText(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chờ thanh toán',
      COMPLETED: 'Đã thanh toán',
      FAILED: 'Thất bại',
      REFUNDED: 'Đã hoàn tiền',
      PARTIALLY_REFUNDED: 'Hoàn tiền một phần',
    };
    return map[status] || status;
  }

  getShipmentStatusText(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chờ xử lý',
      PICKING: 'Đang chuẩn bị hàng',
      PICKED_UP: 'Đã lấy hàng',
      IN_TRANSIT: 'Đang vận chuyển',
      OUT_FOR_DELIVERY: 'Đang giao hàng',
      DELIVERED: 'Đã giao thành công',
      FAILED: 'Giao hàng thất bại',
      CANCELLED: 'Đã hủy',
      RETURNED: 'Đã trả hàng',
    };
    return map[status] || status;
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

  isStepActive(step: TimelineStep): boolean {
    const s = this.order()?.status;
    return s != null && this.statusRank[s] === step.rank;
  }

  isStepPassed(step: TimelineStep): boolean {
    const s = this.order()?.status;
    return s != null && step.rank < this.statusRank[s];
  }

  getTimelineWidth(): string {
    const s = this.order()?.status;
    if (s == null) return '0%';
    const rank = Math.max(0, this.statusRank[s]);
    return `${(rank / 4) * 100}%`;
  }

  getStepTime(rank: number): string | undefined {
    const ord = this.order();
    if (!ord) return undefined;
    switch (rank) {
      case 0: return ord.createdAt;
      case 1: return ord.paidAt || ord.confirmedAt;
      case 2: return ord.preparingAt;
      case 3: return ord.shippedAt;
      case 4: return ord.deliveredAt;
      default: return undefined;
    }
  }

  payNow(): void {
    const ord = this.order();
    if (!ord) return;
    this.isProcessing.set(true);
    this.paymentService
      .initiatePayment({
        orderNumber: ord.orderNumber,
        paymentMethod: ord.paymentMethod as 'VNPAY' | 'MOMO',
      })
      .subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          if (res.success && res.data?.paymentUrl) {
            window.open(res.data.paymentUrl, '_blank', 'noopener');
          } else {
            alert(res.message || 'Không khởi tạo được giao dịch thanh toán.');
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          alert(err.message || 'Khởi tạo thanh toán thất bại.');
        },
      });
  }

  triggerCancel(): void {
    const ord = this.order();
    if (!ord) return;
    const reason = prompt('Nhập lý do bạn muốn hủy đơn hàng:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng!');
      return;
    }
    this.isProcessing.set(true);
    this.orderService.cancelOrder(ord.orderNumber, reason).subscribe({
      next: () => {
        this.isProcessing.set(false);
        alert('Hủy đơn hàng thành công.');
        this.loadOrderDetail(ord.orderNumber);
      },
      error: (err) => {
        this.isProcessing.set(false);
        alert(err.message || 'Hủy đơn hàng thất bại.');
      },
    });
  }

  triggerReturn(): void {
    const ord = this.order();
    if (!ord) return;
    const reason = prompt('Nhập lý do hoàn trả hàng và hoàn tiền:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do trả hàng!');
      return;
    }
    this.isProcessing.set(true);
    this.orderService
      .requestReturn(ord.orderNumber, {
        reason,
        items: ord.items.map(item => ({ orderItemId: item.id, quantity: item.quantity })),
      })
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          alert('Yêu cầu trả hàng đã được gửi! CalmSKIN sẽ liên hệ lại trong vòng 24H để xử lý hoàn tiền.');
          this.loadOrderDetail(ord.orderNumber);
        },
        error: (err) => {
          this.isProcessing.set(false);
          alert(err.message || 'Yêu cầu trả hàng thất bại.');
        },
      });
  }
}
