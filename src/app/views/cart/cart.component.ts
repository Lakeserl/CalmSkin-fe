import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 class="text-3xl font-serif text-brand-charcoal mb-8 border-b pb-4">Giỏ Hàng Của Bạn</h1>
      
      @if (cartItems().length === 0) {
        <!-- Empty Cart -->
        <div class="text-center py-20 bg-white rounded-skincare border p-8 space-y-4 max-w-lg mx-auto shadow-sm">
          <div class="w-16 h-16 rounded-full bg-brand-rosewater text-brand-fuchsia flex items-center justify-center mx-auto animate-skincare-float">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h2 class="text-lg font-semibold text-brand-charcoal">Giỏ hàng của bạn đang trống</h2>
          <p class="text-xs text-brand-muted">Hãy lấp đầy giỏ hàng bằng những sản phẩm chăm sóc làn da khoa học CalmSKIN tuyệt vời nhất nhé.</p>
          <a routerLink="/products" class="inline-block px-8 py-3.5 btn-fuchsia-glow rounded-full text-xs font-bold shadow-md">Mua Sắm Ngay</a>
        </div>
      } @else {
        
        <!-- Cart grid layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <!-- Column 1: Items List (2/3 width) -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cartItems(); track item.productId + (item.variantId || 0)) {
              <div class="flex items-center space-x-4 bg-white p-4 sm:p-5 rounded-skincare border border-brand-fuchsia-light/10 shadow-sm transition-all hover:shadow-md animate-fade-in">
                <!-- Image -->
                <img [src]="item.primaryImageUrl || 'assets/placeholder.jpg'" class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border bg-brand-champagne shrink-0" />
                
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <span class="text-[9px] font-bold text-brand-fuchsia uppercase tracking-wider">Mỹ Phẩm</span>
                  <a [routerLink]="['/products', item.productSlug]" class="block">
                    <h3 class="font-semibold text-brand-charcoal text-xs sm:text-sm truncate hover:text-brand-fuchsia">{{ item.productName }}</h3>
                  </a>
                  @if (item.variantName) {
                    <p class="text-[10px] text-brand-muted mt-0.5">Phân loại: <strong class="text-brand-charcoal">{{ item.variantName }}</strong></p>
                  }
                  
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="text-xs sm:text-sm font-bold text-brand-fuchsia-dark">{{ item.price | currency:'VND':'symbol':'1.0-0' }}</span>
                    @if (item.originalPrice > item.price) {
                      <span class="text-[10px] text-brand-muted line-through">{{ item.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                    }
                  </div>
                </div>

                <!-- Quantity actions -->
                <div class="flex items-center border border-brand-fuchsia-light rounded-lg overflow-hidden shrink-0">
                  <button (click)="updateQty(item, -1)" class="px-2.5 py-1 text-xs text-brand-muted hover:bg-brand-rosewater hover:text-brand-fuchsia focus:outline-none">-</button>
                  <span class="px-3 py-1 text-xs font-semibold w-8 text-center">{{ item.quantity }}</span>
                  <button (click)="updateQty(item, 1)" class="px-2.5 py-1 text-xs text-brand-muted hover:bg-brand-rosewater hover:text-brand-fuchsia focus:outline-none">+</button>
                </div>

                <!-- Delete -->
                <button (click)="removeItem(item.productId, item.variantId)" class="p-2 text-brand-muted hover:text-red-500 rounded-full hover:bg-red-50 transition-all shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            }
          </div>

          <!-- Column 2: Order Summary (1/3 width) -->
          <div class="glass-card p-6 rounded-skincare space-y-6">
            <h3 class="font-bold text-sm text-brand-charcoal border-b pb-2">Tóm Tắt Đơn Hàng</h3>
            
            <div class="space-y-3 text-xs">
              <div class="flex justify-between text-brand-muted">
                <span>Tạm tính (chưa giảm):</span>
                <span>{{ subtotal() | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
              
              @if (savings() > 0) {
                <div class="flex justify-between text-emerald-600 font-medium">
                  <span>Tiết kiệm ưu đãi:</span>
                  <span>-{{ savings() | currency:'VND':'symbol':'1.0-0' }}</span>
                </div>
              }

              <div class="flex justify-between text-brand-muted">
                <span>Phí vận chuyển:</span>
                <span>
                  @if (shippingFee() === 0) {
                    <span class="text-emerald-600 font-bold">Miễn phí</span>
                  } @else {
                    {{ shippingFee() | currency:'VND':'symbol':'1.0-0' }}
                  }
                </span>
              </div>

              @if (shippingFee() > 0) {
                <div class="p-2.5 bg-brand-rosewater text-brand-fuchsia-dark text-[10px] rounded-lg">
                  💡 Mua thêm <strong>{{ (500000 - totalAmount()) | currency:'VND':'symbol':'1.0-0' }}</strong> để được <strong>miễn phí giao hàng</strong> toàn quốc!
                </div>
              }

              <div class="border-t pt-3 flex justify-between text-sm font-bold text-brand-charcoal">
                <span>Tổng số tiền:</span>
                <span class="text-brand-fuchsia-dark text-base">{{ totalCheckout() | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <a routerLink="/checkout" class="block w-full py-3.5 btn-fuchsia-glow rounded-full text-center text-xs font-bold shadow-md">
              Tiến Hành Thanh Toán
            </a>

            <div class="text-center pt-2">
              <a routerLink="/products" class="text-xs text-brand-fuchsia font-semibold hover:underline">← Tiếp tục mua sắm</a>
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class CartComponent {
  private readonly cartService = inject(CartService);

  readonly cartItems = this.cartService.cartItems;
  readonly subtotal = this.cartService.subtotal;
  readonly totalAmount = this.cartService.totalAmount;
  readonly savings = this.cartService.discountAmount;

  // Compute shipping fee: Free for orders > 500,000đ, else 30,000đ
  shippingFee() {
    const total = this.totalAmount();
    if (total === 0 || total >= 500000) return 0;
    return 30000;
  }

  totalCheckout() {
    return this.totalAmount() + this.shippingFee();
  }

  updateQty(item: CartItem, amount: number) {
    this.cartService.updateQuantity(item.productId, item.quantity + amount, item.variantId);
  }

  removeItem(productId: number, variantId?: number) {
    this.cartService.removeFromCart(productId, variantId);
  }
}
