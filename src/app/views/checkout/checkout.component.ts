import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService, VietnamRegion } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 class="text-3xl font-serif text-brand-charcoal mb-8 border-b pb-4">Đặt Hàng & Thanh Toán</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <!-- Column 1 & 2: Form (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Shipping Address Form -->
          <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-4">
            <h2 class="text-lg font-serif font-bold text-brand-charcoal flex items-center space-x-2">
              <span class="p-1 rounded-full bg-brand-rosewater text-brand-fuchsia">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </span>
              <span>Thông Tin Nhận Hàng</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Tên Người Nhận</label>
                <input type="text" [(ngModel)]="recipientName" name="recipientName" required placeholder="VD: Nguyễn Anh" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Số Điện Thoại</label>
                <input type="tel" [(ngModel)]="recipientPhone" name="recipientPhone" required placeholder="VD: 0912345678" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50" />
              </div>
            </div>

            <!-- Vietnam Address Selector Cascading dropdowns -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <!-- Province -->
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Tỉnh / Thành Phố</label>
                <select [(ngModel)]="selectedProvince" (change)="onProvinceChange()" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-white">
                  <option value="">Chọn Tỉnh/Thành</option>
                  @for (prov of provinces; track prov.name) {
                    <option [value]="prov.name">{{ prov.name }}</option>
                  }
                </select>
              </div>

              <!-- District -->
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Quận / Huyện</label>
                <select [(ngModel)]="selectedDistrict" (change)="onDistrictChange()" [disabled]="!selectedProvince" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-white disabled:opacity-50">
                  <option value="">Chọn Quận/Huyện</option>
                  @for (dist of filteredDistricts; track dist.name) {
                    <option [value]="dist.name">{{ dist.name }}</option>
                  }
                </select>
              </div>

              <!-- Ward -->
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Phường / Xã</label>
                <select [(ngModel)]="selectedWard" [disabled]="!selectedDistrict" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-white disabled:opacity-50">
                  <option value="">Chọn Phường/Xã</option>
                  @for (ward of filteredWards; track ward) {
                    <option [value]="ward">{{ ward }}</option>
                  }
                </select>
              </div>

            </div>

            <!-- Street Address -->
            <div class="space-y-1">
              <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Địa Chỉ Cụ Thể (Số nhà, Tên đường)</label>
              <input type="text" [(ngModel)]="streetAddress" name="streetAddress" placeholder="VD: 15/4 Lê Lợi" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50" />
            </div>

            <!-- Order Note -->
            <div class="space-y-1">
              <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Ghi Chú Đơn Hàng (Tuỳ chọn)</label>
              <textarea [(ngModel)]="orderNote" name="note" rows="2" placeholder="VD: Giao giờ hành chính, gọi trước khi giao..." class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50"></textarea>
            </div>
          </div>

          <!-- Loyalty points / discount selection -->
          <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-4">
            <h2 class="text-lg font-serif font-bold text-brand-charcoal flex items-center space-x-2">
              <span class="p-1 rounded-full bg-brand-rosewater text-brand-fuchsia">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </span>
              <span>Điểm Thưởng Tích Lũy</span>
            </h2>
            
            <div class="flex items-center justify-between p-4 bg-brand-rosewater/30 border border-brand-fuchsia-light/20 rounded-xl text-xs">
              <div>
                <p class="font-semibold text-brand-charcoal">Ví tích xu của bạn:</p>
                <p class="text-brand-muted mt-1">Đang có: <strong>{{ maxPoints() }} xu</strong> (1 xu = 1.000đ giảm giá)</p>
              </div>
              
              <div class="flex items-center space-x-2">
                <input 
                  type="number" 
                  [(ngModel)]="pointsToUse" 
                  [max]="maxPoints()" 
                  min="0"
                  class="w-20 px-2 py-1.5 border rounded-lg focus:outline-none text-center font-bold text-brand-fuchsia-dark"
                />
                <button (click)="applyPoints()" class="px-3 py-1.5 bg-brand-fuchsia text-white rounded-lg font-bold text-[10px] hover:bg-brand-fuchsia-dark transition-all">
                  Áp Dụng
                </button>
              </div>
            </div>
          </div>

          <!-- Payment Methods selection -->
          <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-4">
            <h2 class="text-lg font-serif font-bold text-brand-charcoal flex items-center space-x-2">
              <span class="p-1 rounded-full bg-brand-rosewater text-brand-fuchsia">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </span>
              <span>Phương Thức Thanh Toán</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <!-- COD Option -->
              <label 
                (click)="paymentMethod.set('COD')"
                [class.border-brand-fuchsia]="paymentMethod() === 'COD'"
                [class.bg-brand-rosewater/40]="paymentMethod() === 'COD'"
                class="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-brand-rosewater/10 transition-all"
              >
                <input type="radio" name="payment" value="COD" [checked]="paymentMethod() === 'COD'" class="text-brand-fuchsia focus:ring-brand-fuchsia" />
                <div>
                  <h4 class="text-brand-charcoal font-bold">Thanh toán khi nhận hàng (COD)</h4>
                  <p class="text-[10px] text-brand-muted mt-0.5 font-normal">Giao hàng và thu tiền mặt tận nơi.</p>
                </div>
              </label>

              <!-- VNPay Option -->
              <label 
                (click)="paymentMethod.set('VNPAY')"
                [class.border-brand-fuchsia]="paymentMethod() === 'VNPAY'"
                [class.bg-brand-rosewater/40]="paymentMethod() === 'VNPAY'"
                class="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-brand-rosewater/10 transition-all"
              >
                <input type="radio" name="payment" value="VNPAY" [checked]="paymentMethod() === 'VNPAY'" class="text-brand-fuchsia focus:ring-brand-fuchsia" />
                <div>
                  <h4 class="text-brand-charcoal font-bold">Thanh toán trực tuyến VNPay</h4>
                  <p class="text-[10px] text-brand-muted mt-0.5 font-normal">Quét mã QR hoặc Thẻ ATM ngân hàng.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

        <!-- Column 3: Cart Preview & Place Order button -->
        <div class="space-y-6">
          <div class="glass-card p-6 rounded-skincare space-y-6">
            <h3 class="font-bold text-sm text-brand-charcoal border-b pb-2">Đơn Hàng Của Bạn</h3>
            
            <!-- Items scroll -->
            <div class="max-h-48 overflow-y-auto space-y-3 pr-1">
              @for (item of cartItems(); track item.productId) {
                <div class="flex items-center space-x-3 text-xs">
                  <img [src]="item.primaryImageUrl || 'assets/placeholder.jpg'" class="w-10 h-10 object-cover rounded border" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-brand-charcoal truncate">{{ item.productName }}</h4>
                    <p class="text-[10px] text-brand-muted mt-0.5">{{ item.quantity }} x {{ item.price | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-2 border-t pt-3 text-xs">
              <div class="flex justify-between text-brand-muted">
                <span>Tạm tính:</span>
                <span>{{ subtotal() | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between text-brand-muted">
                <span>Phí vận chuyển:</span>
                <span>{{ shippingFee() === 0 ? 'Miễn phí' : (shippingFee() | currency:'VND':'symbol':'1.0-0') }}</span>
              </div>
              
              @if (discountAmount() > 0) {
                <div class="flex justify-between text-emerald-600 font-medium">
                  <span>Tiết kiệm (giá KM):</span>
                  <span>-{{ discountAmount() | currency:'VND':'symbol':'1.0-0' }}</span>
                </div>
              }

              @if (pointsApplied() > 0) {
                <div class="flex justify-between text-emerald-600 font-medium">
                  <span>Dùng điểm tích lũy:</span>
                  <span>-{{ (pointsApplied() * 1000) | currency:'VND':'symbol':'1.0-0' }}</span>
                </div>
              }

              <div class="border-t pt-3 flex justify-between text-sm font-bold text-brand-charcoal">
                <span>Tổng chi phí:</span>
                <span class="text-brand-fuchsia-dark text-base">{{ checkoutTotal() | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <!-- Place order button -->
            <button 
              (click)="onSubmitOrder()" 
              [disabled]="isLoading() || cartItems().length === 0"
              class="w-full py-3.5 btn-fuchsia-glow rounded-full text-center text-xs font-bold shadow-md disabled:opacity-50"
            >
              @if (isLoading()) {
                <span>Đang xử lý đơn hàng...</span>
              } @else {
                <span>{{ paymentMethod() === 'COD' ? 'Xác Nhận Đặt Hàng' : 'Tiến Hành Thanh Toán' }}</span>
              }
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- MOCK VNPAY ONLINE GATEWAY POPUP MODAL -->
    @if (showVnPayModal()) {
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-skincare shadow-2xl border max-w-md w-full p-6 space-y-6 relative overflow-hidden">
          
          <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

          <!-- VNPay Brand -->
          <div class="flex items-center justify-between border-b pb-4">
            <span class="text-xl font-extrabold tracking-widest text-blue-700 font-sans">VNPAY<span class="text-red-500 font-normal">QR</span></span>
            <span class="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">SECURE GATEWAY</span>
          </div>

          <!-- Transaction details -->
          <div class="space-y-3 bg-stone-50 p-4 rounded-xl text-xs">
            <div class="flex justify-between">
              <span class="text-stone-500">Đơn vị thụ hưởng:</span>
              <strong class="text-stone-800">CalmSKIN Cosmetics Lab</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500">Mã đơn hàng:</span>
              <strong class="text-stone-800">{{ createdOrderNumber() }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500">Số tiền giao dịch:</span>
              <strong class="text-blue-700 font-bold text-sm">{{ checkoutTotal() | currency:'VND':'symbol':'1.0-0' }}</strong>
            </div>
          </div>

          <!-- VNPay Simulation Screen -->
          <div class="border border-blue-100 p-5 rounded-xl text-center space-y-4 bg-blue-50/20">
            <div class="w-20 h-20 bg-white border border-stone-200 rounded-lg mx-auto flex items-center justify-center shadow-inner relative">
              <!-- Simulated QR code lines -->
              <div class="w-16 h-16 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded opacity-80 flex flex-col justify-between p-1.5">
                <div class="flex justify-between"><div class="w-3 h-3 bg-white"></div><div class="w-3 h-3 bg-white"></div></div>
                <div class="flex justify-between"><div class="w-3 h-3 bg-white"></div><div class="w-3 h-3 bg-white"></div></div>
              </div>
            </div>
            <div>
              <h4 class="font-bold text-stone-800 text-xs">Quét mã QR bằng ứng dụng ngân hàng</h4>
              <p class="text-[10px] text-stone-500 mt-0.5">Hoặc bấm nút bên dưới để thanh toán giả lập nhanh</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button 
              (click)="onCancelVnPay()"
              class="py-3 border border-stone-200 text-stone-600 rounded-full text-xs font-semibold hover:bg-stone-50 transition-all"
            >
              Hủy giao dịch
            </button>
            <button 
              (click)="onConfirmVnPaySuccess()"
              class="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow transition-all"
            >
              Thanh Toán Thành Công
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class CheckoutComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  // Cart summary
  readonly cartItems = this.cartService.cartItems;
  readonly subtotal = this.cartService.subtotal;
  readonly totalAmount = this.cartService.totalAmount;
  readonly discountAmount = this.cartService.discountAmount;

  // Address picking
  provinces: VietnamRegion[] = [];
  filteredDistricts: { name: string; wards: string[] }[] = [];
  filteredWards: string[] = [];

  recipientName = '';
  recipientPhone = '';
  selectedProvince = '';
  selectedDistrict = '';
  selectedWard = '';
  streetAddress = '';
  orderNote = '';

  // Loyalty points
  readonly maxPoints = signal(0);
  pointsToUse = 0;
  readonly pointsApplied = signal(0);

  // Checkout State
  readonly paymentMethod = signal<'COD' | 'VNPAY'>('COD');
  readonly isLoading = signal(false);
  
  // VNPAY Simulation
  readonly showVnPayModal = signal(false);
  readonly createdOrderNumber = signal('');

  shippingFee() {
    const total = this.totalAmount();
    if (total === 0 || total >= 500000) return 0;
    return 30000;
  }

  checkoutTotal() {
    const currentPrice = this.totalAmount() - (this.pointsApplied() * 1000);
    return Math.max(0, currentPrice + this.shippingFee());
  }

  ngOnInit(): void {
    // Populate user profile info
    const user = this.authService.currentUser();
    if (user) {
      this.recipientName = user.fullName;
      this.recipientPhone = user.phoneNumber || '';
      this.maxPoints.set(user.points || 0);
    }

    // Load regions
    this.provinces = this.orderService.getVietnamRegions();
  }

  onProvinceChange() {
    const prov = this.provinces.find(p => p.name === this.selectedProvince);
    this.filteredDistricts = prov ? prov.districts : [];
    this.selectedDistrict = '';
    this.filteredWards = [];
    this.selectedWard = '';
  }

  onDistrictChange() {
    const dist = this.filteredDistricts.find(d => d.name === this.selectedDistrict);
    this.filteredWards = dist ? dist.wards : [];
    this.selectedWard = '';
  }

  applyPoints() {
    const points = Math.min(this.maxPoints(), Math.max(0, this.pointsToUse));
    
    // Check if points discount exceeds total order value
    const pointsValue = points * 1000;
    if (pointsValue > this.totalAmount()) {
      alert('Số điểm quy đổi vượt quá giá trị đơn hàng!');
      this.pointsToUse = 0;
      this.pointsApplied.set(0);
      return;
    }

    this.pointsApplied.set(points);
    alert(`Đã áp dụng giảm giá ${pointsValue.toLocaleString('vi-VN')}đ từ điểm thưởng!`);
  }

  onSubmitOrder() {
    if (!this.recipientName || !this.recipientPhone || !this.selectedProvince || !this.selectedDistrict || !this.selectedWard || !this.streetAddress) {
      alert('Vui lòng điền đầy đủ thông tin nhận hàng!');
      return;
    }

    this.isLoading.set(true);

    // Assemble payload
    const payload = {
      items: this.cartItems().map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      })),
      addressId: 999, // Backend has addressId. We pass 999 as mock ID, downstream will read coordinates
      paymentMethod: this.paymentMethod(),
      pointsToUse: this.pointsApplied(),
      note: `${this.orderNote} [Địa chỉ nhận: ${this.streetAddress}, ${this.selectedWard}, ${this.selectedDistrict}, ${this.selectedProvince}]`
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const order = res.data;
          this.createdOrderNumber.set(order.orderNumber);

          if (this.paymentMethod() === 'VNPAY') {
            // Trigger VNPAY online simulation portal!
            this.showVnPayModal.set(true);
          } else {
            // COD direct success
            this.handleCheckoutSuccess();
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Đặt hàng không thành công. Lỗi cổng thanh toán.');
      }
    });
  }

  onConfirmVnPaySuccess() {
    this.showVnPayModal.set(false);
    this.isLoading.set(true);

    // Call AdminOrder status update API to mock payment successful confirmation (PAID status)
    this.adminService.updateOrderStatus(this.createdOrderNumber(), 'CONFIRMED', 'Thanh toán trực tuyến thành công qua VNPAY').subscribe({
      next: () => {
        this.isLoading.set(false);
        this.handleCheckoutSuccess();
      },
      error: () => {
        // Fallback if admin auth is bypassed or pending
        this.isLoading.set(false);
        this.handleCheckoutSuccess();
      }
    });
  }

  onCancelVnPay() {
    this.showVnPayModal.set(false);
    alert('Thanh toán trực tuyến VNPay đã bị hủy. Đơn hàng đang ở trạng thái CHỜ THANH TOÁN (PENDING).');
    this.cartService.clearCart();
    this.router.navigate(['/orders', this.createdOrderNumber()]);
  }

  private handleCheckoutSuccess() {
    alert('Đặt hàng thành công! Cám ơn bạn đã lựa chọn CalmSKIN.');
    this.cartService.clearCart();
    this.router.navigate(['/orders', this.createdOrderNumber()]);
  }
}
