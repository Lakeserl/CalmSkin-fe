import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem {
  productId: number;
  productName: string;
  productSlug: string;
  primaryImageUrl?: string;
  variantId?: number;
  variantName?: string;
  quantity: number;
  price: number;       // active selling price
  originalPrice: number; // original base price
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Angular Signals state
  readonly cartItems = signal<CartItem[]>([]);

  // Reactive computed properties
  readonly totalItemsCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.originalPrice * item.quantity), 0);
  });

  readonly totalAmount = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  readonly discountAmount = computed(() => {
    return this.subtotal() - this.totalAmount();
  });

  constructor() {
    this.loadCart();
    
    // Automatically persist cart to localStorage whenever the signal changes
    effect(() => {
      localStorage.setItem('calmskin_cart', JSON.stringify(this.cartItems()));
    });
  }

  addToCart(newItem: CartItem): void {
    const items = [...this.cartItems()];
    const existingIndex = items.findIndex(
      item => item.productId === newItem.productId && item.variantId === newItem.variantId
    );

    if (existingIndex > -1) {
      // Increment quantity, capped at 99
      const currentQty = items[existingIndex].quantity;
      items[existingIndex].quantity = Math.min(99, currentQty + newItem.quantity);
    } else {
      items.push(newItem);
    }

    this.cartItems.set(items);
  }

  removeFromCart(productId: number, variantId?: number): void {
    const updated = this.cartItems().filter(
      item => !(item.productId === productId && item.variantId === variantId)
    );
    this.cartItems.set(updated);
  }

  updateQuantity(productId: number, quantity: number, variantId?: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, variantId);
      return;
    }

    const items = this.cartItems().map(item => {
      if (item.productId === productId && item.variantId === variantId) {
        return { ...item, quantity: Math.min(99, quantity) };
      }
      return item;
    });

    this.cartItems.set(items);
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  private loadCart(): void {
    const stored = localStorage.getItem('calmskin_cart');
    if (stored) {
      try {
        this.cartItems.set(JSON.parse(stored));
      } catch (e) {
        this.cartItems.set([]);
      }
    }
  }
}
