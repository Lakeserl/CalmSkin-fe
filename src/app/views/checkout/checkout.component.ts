import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService, VietnamRegion } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { AddressDTO, AddressRequest } from '../../core/models/auth.model';
import { CreateOrderRequest, PaymentMethod } from '../../core/models/order.model';
import { PaymentMethodCode } from '../../core/models/payment.model';

type CheckoutMethod = 'COD' | 'VNPAY' | 'MOMO';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 class="text-3xl font-serif text-brand-charcoal mb-8 border-b pb-4">Đặt Hàng & Thanh Toán</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        <!-- Column 1 & 2: Form (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Shipping Address -->
          <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-serif font-bold text-brand-charcoal flex items-center space-x-2">
                <span class="p-1 rounded-full bg-brand-rosewater text-brand-fuchsia">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </span>
                <span>Thông Tin Nhận Hàng</span>
              </h2>
              @if (savedAddresses().length > 0) {
                <button (click)="toggleAddingNew()" class="text-[10px] font-bold text-brand-fuchsia hover:underline">
                  {{ addingNewAddress() ? 'Chọn địa chỉ đã lưu' : '+ Thêm địa chỉ mới' }}
                </button>
              }
            </div>

            @if (isLoadingAddresses()) {
              <div class="h-20 bg-stone-50 border rounded-xl animate-pulse"></div>
            }

            <!-- Saved address picker -->
            @if (!isLoadingAddresses() && !addingNewAddress()) {
              <div class="space-y-3">
                @for (addr of savedAddresses(); track addr.id) {
                  <label
                    (click)="selectedAddressId.set(addr.id)"
                    [class.border-brand-fuchsia]="selectedAddressId() === addr.id"
                    [class.bg-brand-rosewater/30]="selectedAddressId() === addr.id"
                    class="flex items-start space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-brand-rosewater/10 transition-all text-xs"
                  >
                    <input type="radio" name="addr" [checked]="selectedAddressId() === addr.id" class="mt-0.5 text-brand-fuchsia focus:ring-brand-fuchsia" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2">
                        <strong class="text-brand-charcoal">{{ addr.recipientName }}</strong>
                        <span class="text-brand-muted">| {{ addr.phone }}</span>
                        @if (addr.isDefault) {
                          <span class="bg-brand-fuchsia/10 text-brand-fuchsia-dark text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Mặc định</span>
                        }
                      </div>
                      <p class="text-brand-muted mt-1 leading-relaxed">{{ addr.street }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.province }}</p>
                    </div>
                  </label>
                }
              </div>
            }

            <!-- New address form -->
            @if (!isLoadingAddresses() && addingNewAddress()) {
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Tên Người Nhận</label>
                    <input type="text" [(ngModel)]="recipientName" name="recipientName" placeholder="VD: Nguyễn Anh" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Số Điện Thoại</label>
                    <input type="tel" [(ngModel)]="recipientPhone" name="recipientPhone" placeholder="VD: 0912345678" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="space-y-1">
                    <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Tỉnh / Thành Phố</label>
                    <select [(ngModel)]="selectedProvince" (change)="onProvinceChange()" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-white">
                      <option value="">Chọn Tỉnh/Thành</option>
                      @for (prov of provinces; track prov.name) {
                        <option [value]="prov.name">{{ prov.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Quận / Huyện</label>
                    <select [(ngModel)]="selectedDistrict" (change)="onDistrictChange()" [disabled]="!selectedProvince" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-white disabled:opacity-50">
                      <option value="">Chọn Quận/Huyện</option>
                      @for (dist of filteredDistricts; track dist.name) {
                        <option [value]="dist.name">{{ dist.name }}</option>
                      }
                    </select>
                  </div>
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

                <div class="space-y-1">
                  <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Địa Chỉ Cụ Thể (Số nhà, Tên đường)</label>
                  <input type="text" [(ngModel)]="streetAddress" name="streetAddress" placeholder="VD: 15/4 Lê Lợi" class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50" />
                </div>

                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="setAsDefault" name="setDefault" class="text-brand-fuchsia focus:ring-brand-fuchsia" />
                  <span class="text-[10px] text-brand-muted font-bold">Đặt làm địa chỉ nhận hàng mặc định</span>
                </label>
              </div>
            }

            <!-- Order note -->
            <div class="space-y-1">
              <label class="text-[10px] font-semibold text-brand-charcoal uppercase tracking-wider">Ghi Chú Đơn Hàng (Tuỳ chọn)</label>
              <textarea [(ngModel)]="orderNote" name="note" rows="2" placeholder="VD: Giao giờ hành chính, gọi trước khi giao..." class="w-full px-3 py-2.5 rounded-xl border border-brand-fuchsia-light text-xs bg-stone-50/50"></textarea>
            </div>
          </div>

          <!-- Loyalty points -->
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
                <input type="number" [(ngModel)]="pointsToUse" [max]="maxPoints()" min="0"
                  class="w-20 px-2 py-1.5 border rounded-lg focus:outline-none text-center font-bold text-brand-fuchsia-dark" />
                <button (click)="applyPoints()" class="px-3 py-1.5 bg-brand-fuchsia text-white rounded-lg font-bold text-[10px] hover:bg-brand-fuchsia-dark transition-all">
                  Áp Dụng
                </button>
              </div>
            </div>
          </div>

          <!-- Payment methods -->
          <div class="bg-white p-6 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm space-y-4">
            <h2 class="text-lg font-serif font-bold text-brand-charcoal flex items-center space-x-2">
              <span class="p-1 rounded-full bg-brand-rosewater text-brand-fuchsia">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </span>
              <span>Phương Thức Thanh Toán</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              @for (method of paymentOptions; track method.value) {
                <label
                  (click)="paymentMethod.set(method.value)"
                  [class.border-brand-fuchsia]="paymentMethod() === method.value"
                  [class.bg-brand-rosewater/40]="paymentMethod() === method.value"
                  class="flex items-start space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-brand-rosewater/10 transition-all"
                >
                  <input type="radio" name="payment" [checked]="paymentMethod() === method.value" class="mt-0.5 text-brand-fuchsia focus:ring-brand-fuchsia" />
                  <div>
                    <h4 class="text-brand-charcoal font-bold">{{ method.label }}</h4>
                    <p class="text-[10px] text-brand-muted mt-0.5 font-normal">{{ method.hint }}</p>
                  </div>
                </label>
              }
            </div>
          </div>

        </div>

        <!-- Column 3: Cart preview & place order -->
        <div class="space-y-6">
          <div class="glass-card p-6 rounded-skincare space-y-6">
            <h3 class="font-bold text-sm text-brand-charcoal border-b pb-2">Đơn Hàng Của Bạn</h3>

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

            @if (errorMessage()) {
              <p class="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{{ errorMessage() }}</p>
            }

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

    <!-- ONLINE GATEWAY PAYMENT MODAL (backed by payment-service) -->
    @if (showGatewayModal()) {
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-skincare shadow-2xl border max-w-md w-full p-6 space-y-6 relative overflow-hidden">

          <div class="absolute top-0 left-0 right-0 h-2"
            [ngClass]="paymentMethod() === 'MOMO' ? 'bg-gradient-to-r from-pink-600 to-fuchsia-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'">
          </div>

          <div class="flex items-center justify-between border-b pb-4">
            @if (paymentMethod() === 'MOMO') {
              <span class="text-xl font-extrabold tracking-widest text-pink-600 font-sans">MoMo</span>
            } @else {
              <span class="text-xl font-extrabold tracking-widest text-blue-700 font-sans">VNPAY<span class="text-red-500 font-normal">QR</span></span>
            }
            <span class="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">SANDBOX GATEWAY</span>
          </div>

          <div class="space-y-3 bg-stone-50 p-4 rounded-xl text-xs">
            <div class="flex justify-between">
              <span class="text-stone-500">Đơn vị thụ hưởng:</span>
              <strong class="text-stone-800">CalmSKIN Cosmetics Lab</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500">Mã đơn hàng:</span>
              <strong class="text-stone-800 font-mono">{{ createdOrderNumber() }}</strong>
            </div>
            @if (paymentNumber()) {
              <div class="flex justify-between">
                <span class="text-stone-500">Mã thanh toán:</span>
                <strong class="text-stone-800 font-mono">{{ paymentNumber() }}</strong>
              </div>
            }
            <div class="flex justify-between">
              <span class="text-stone-500">Số tiền giao dịch:</span>
              <strong class="text-blue-700 font-bold text-sm">{{ checkoutTotal() | currency:'VND':'symbol':'1.0-0' }}</strong>
            </div>
          </div>

          <div class="border border-blue-100 p-5 rounded-xl text-center space-y-3 bg-blue-50/20">
            @if (paymentPolling()) {
              <div class="w-10 h-10 mx-auto border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <h4 class="font-bold text-stone-800 text-xs">Đang chờ xác nhận thanh toán...</h4>
              <p class="text-[10px] text-stone-500">
                Bấm nút bên dưới để mở cổng thanh toán sandbox và hoàn tất giao dịch.
                Hệ thống sẽ tự động cập nhật khi nhận được kết quả.
              </p>
            } @else {
              <h4 class="font-bold text-stone-800 text-xs">{{ gatewayStatusText() }}</h4>
            }

            @if (paymentUrl()) {
              <a [href]="paymentUrl()" target="_blank" rel="noopener"
                 class="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow transition-all">
                Mở cổng thanh toán
              </a>
            }
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <button (click)="onCloseGatewayModal()"
              class="py-3 border border-stone-200 text-stone-600 rounded-full text-xs font-semibold hover:bg-stone-50 transition-all">
              Thanh toán sau
            </button>
            <button (click)="checkPaymentNow()" [disabled]="!paymentNumber()"
              class="py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-full text-xs font-bold shadow transition-all disabled:opacity-50">
              Kiểm tra trạng thái
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
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Cart summary
  readonly cartItems = this.cartService.cartItems;
  readonly subtotal = this.cartService.subtotal;
  readonly totalAmount = this.cartService.totalAmount;
  readonly discountAmount = this.cartService.discountAmount;

  // Saved addresses
  readonly savedAddresses = signal<AddressDTO[]>([]);
  readonly selectedAddressId = signal<string>('');
  readonly addingNewAddress = signal(false);
  readonly isLoadingAddresses = signal(false);

  // New-address form
  provinces: VietnamRegion[] = [];
  filteredDistricts: { name: string; wards: string[] }[] = [];
  filteredWards: string[] = [];
  recipientName = '';
  recipientPhone = '';
  selectedProvince = '';
  selectedDistrict = '';
  selectedWard = '';
  streetAddress = '';
  setAsDefault = false;
  orderNote = '';

  // Loyalty points
  readonly maxPoints = signal(0);
  pointsToUse = 0;
  readonly pointsApplied = signal(0);

  // Checkout state
  readonly paymentMethod = signal<CheckoutMethod>('COD');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly paymentOptions: { value: CheckoutMethod; label: string; hint: string }[] = [
    { value: 'COD', label: 'Thanh toán khi nhận hàng', hint: 'Giao hàng và thu tiền mặt tận nơi (COD).' },
    { value: 'VNPAY', label: 'Cổng VNPay', hint: 'Quét mã QR hoặc Thẻ ATM ngân hàng.' },
    { value: 'MOMO', label: 'Ví MoMo', hint: 'Thanh toán qua ứng dụng ví điện tử MoMo.' },
  ];

  // Online gateway state
  readonly showGatewayModal = signal(false);
  readonly createdOrderNumber = signal('');
  readonly paymentNumber = signal('');
  readonly paymentUrl = signal('');
  readonly paymentPolling = signal(false);
  readonly gatewayStatusText = signal('');

  shippingFee(): number {
    const total = this.totalAmount();
    if (total === 0 || total >= 500000) return 0;
    return 30000;
  }

  checkoutTotal(): number {
    const currentPrice = this.totalAmount() - this.pointsApplied() * 1000;
    return Math.max(0, currentPrice + this.shippingFee());
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.recipientName = user.fullName;
      this.recipientPhone = user.phoneNumber || '';
      this.maxPoints.set(user.points || 0);
    }
    this.provinces = this.orderService.getVietnamRegions();
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.isLoadingAddresses.set(true);
    this.authService.getUserAddresses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
        this.isLoadingAddresses.set(false);
        const list: AddressDTO[] = res.success && res.data ? res.data : [];
        this.savedAddresses.set(list);
        if (list.length > 0) {
          const preferred = list.find(a => a.isDefault) ?? list[0];
          this.selectedAddressId.set(preferred.id);
          this.addingNewAddress.set(false);
        } else {
          this.addingNewAddress.set(true);
        }
      },
      error: () => {
        this.isLoadingAddresses.set(false);
        this.savedAddresses.set([]);
        this.addingNewAddress.set(true);
      },
      });
  }

  toggleAddingNew(): void {
    this.addingNewAddress.set(!this.addingNewAddress());
  }

  onProvinceChange(): void {
    const prov = this.provinces.find(p => p.name === this.selectedProvince);
    this.filteredDistricts = prov ? prov.districts : [];
    this.selectedDistrict = '';
    this.filteredWards = [];
    this.selectedWard = '';
  }

  onDistrictChange(): void {
    const dist = this.filteredDistricts.find(d => d.name === this.selectedDistrict);
    this.filteredWards = dist ? dist.wards : [];
    this.selectedWard = '';
  }

  applyPoints(): void {
    const points = Math.min(this.maxPoints(), Math.max(0, this.pointsToUse));
    if (points * 1000 > this.totalAmount()) {
      alert('Số điểm quy đổi vượt quá giá trị đơn hàng!');
      this.pointsToUse = 0;
      this.pointsApplied.set(0);
      return;
    }
    this.pointsApplied.set(points);
    alert(`Đã áp dụng giảm giá ${(points * 1000).toLocaleString('vi-VN')}đ từ điểm thưởng!`);
  }

  onSubmitOrder(): void {
    this.errorMessage.set('');

    if (this.addingNewAddress()) {
      if (!this.recipientName || !this.recipientPhone || !this.selectedProvince
          || !this.selectedDistrict || !this.selectedWard || !this.streetAddress) {
        this.errorMessage.set('Vui lòng điền đầy đủ thông tin địa chỉ nhận hàng!');
        return;
      }
      // A real order needs a persisted address UUID — save it first.
      this.isLoading.set(true);
      const newAddress: AddressRequest = {
        recipientName: this.recipientName,
        phone: this.recipientPhone,
        province: this.selectedProvince,
        district: this.selectedDistrict,
        ward: this.selectedWard,
        street: this.streetAddress,
        isDefault: this.setAsDefault,
      };
      this.authService.addAddress(newAddress)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: (res) => {
          if (res.success && res.data?.id) {
            this.createOrderWithAddress(res.data.id);
          } else {
            this.isLoading.set(false);
            this.errorMessage.set(res.message || 'Không lưu được địa chỉ nhận hàng.');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Không lưu được địa chỉ nhận hàng.');
        },
      });
    } else {
      if (!this.selectedAddressId()) {
        this.errorMessage.set('Vui lòng chọn một địa chỉ nhận hàng.');
        return;
      }
      this.isLoading.set(true);
      this.createOrderWithAddress(this.selectedAddressId());
    }
  }

  private createOrderWithAddress(addressId: string): void {
    const payload: CreateOrderRequest = {
      items: this.cartItems().map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      addressId,
      paymentMethod: this.paymentMethod() as PaymentMethod,
      pointsToUse: this.pointsApplied(),
      note: this.orderNote || undefined,
    };

    this.orderService.createOrder(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.createdOrderNumber.set(res.data.orderNumber);
          if (this.paymentMethod() === 'COD') {
            this.isLoading.set(false);
            this.handleCheckoutSuccess();
          } else {
            this.initiateOnlinePayment();
          }
        } else {
          this.isLoading.set(false);
          this.errorMessage.set(res.message || 'Đặt hàng không thành công.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Đặt hàng không thành công.');
      },
    });
  }

  /** Calls payment-service /initiate, opens the gateway modal and polls status. */
  private initiateOnlinePayment(): void {
    this.paymentService
      .initiatePayment({
        orderNumber: this.createdOrderNumber(),
        paymentMethod: this.paymentMethod() as PaymentMethodCode,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.success && res.data) {
            this.paymentNumber.set(res.data.paymentNumber);
            this.paymentUrl.set(res.data.paymentUrl || '');
            this.showGatewayModal.set(true);
            this.startPolling();
          } else {
            this.errorMessage.set(res.message || 'Không khởi tạo được giao dịch thanh toán.');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            (err.message || 'Khởi tạo thanh toán thất bại.') +
            ' Đơn hàng đã được tạo, bạn có thể thanh toán lại trong trang chi tiết đơn.',
          );
          this.cartService.clearCart();
          this.router.navigate(['/orders', this.createdOrderNumber()]);
        },
      });
  }

  private startPolling(): void {
    this.paymentPolling.set(true);
    this.gatewayStatusText.set('Đang chờ thanh toán...');
    this.paymentService
      .pollPaymentStatus(this.paymentNumber())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payment) => {
          if (payment.status === 'COMPLETED') {
            this.paymentPolling.set(false);
            this.showGatewayModal.set(false);
            this.handleCheckoutSuccess();
          } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(payment.status)) {
            this.paymentPolling.set(false);
            this.gatewayStatusText.set(
              payment.failureReason || 'Giao dịch không thành công. Vui lòng thử lại.',
            );
          }
        },
        error: () => {
          this.paymentPolling.set(false);
          this.gatewayStatusText.set('Không kiểm tra được trạng thái thanh toán.');
        },
        complete: () => {
          if (this.paymentPolling()) {
            this.paymentPolling.set(false);
            this.gatewayStatusText.set('Chưa nhận được xác nhận thanh toán. Bạn có thể kiểm tra lại sau.');
          }
        },
      });
  }

  /** Manual one-shot status check from the modal. */
  checkPaymentNow(): void {
    if (!this.paymentNumber()) return;
    this.paymentService.getPayment(this.paymentNumber())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        const payment = res.data;
        if (payment?.status === 'COMPLETED') {
          this.showGatewayModal.set(false);
          this.handleCheckoutSuccess();
        } else {
          this.gatewayStatusText.set('Giao dịch chưa hoàn tất — trạng thái hiện tại: ' + (payment?.status || 'PENDING'));
        }
      },
      error: () => this.gatewayStatusText.set('Không kiểm tra được trạng thái thanh toán.'),
    });
  }

  onCloseGatewayModal(): void {
    this.showGatewayModal.set(false);
    this.paymentPolling.set(false);
    this.cartService.clearCart();
    this.router.navigate(['/orders', this.createdOrderNumber()]);
  }

  private handleCheckoutSuccess(): void {
    this.cartService.clearCart();
    this.router.navigate(['/orders', this.createdOrderNumber()]);
  }
}
