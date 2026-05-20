import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { OrderDTO, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">
      
      <!-- Header -->
      <div class="border-b border-slate-800 pb-5">
        <h1 class="text-3xl font-serif font-bold text-white">Quản Lý Đơn Hàng</h1>
        <p class="text-xs text-slate-400 mt-1">Phê duyệt trạng thái thanh toán, đóng gói vận chuyển và xử lý hoàn trả CalmSKIN.</p>
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

      <!-- Orders Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
        @if (isLoading()) {
          <div class="p-20 text-center text-slate-400">Đang tải danh sách đơn hàng...</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-850 font-bold bg-slate-950 text-slate-400">
                  <th class="p-4">Mã Đơn Hàng</th>
                  <th class="p-4">Khách Hàng</th>
                  <th class="p-4">Ngày Đặt</th>
                  <th class="p-4">Giá Trị</th>
                  <th class="p-4">Hình Thức</th>
                  <th class="p-4">Trạng Thái</th>
                  <th class="p-4 text-center">Thao Tác Duyệt</th>
                </tr>
              </thead>
              <tbody>
                @for (ord of filteredOrders(); track ord.id) {
                  <tr class="border-b border-slate-850 hover:bg-slate-850/40 transition-colors">
                    <td class="p-4 font-mono font-bold text-white">{{ ord.orderNumber }}</td>
                    <td class="p-4">
                      <p class="font-semibold text-slate-200">{{ ord.shippingName }}</p>
                      <p class="text-[10px] text-slate-400">SĐT: {{ ord.shippingPhone }}</p>
                    </td>
                    <td class="p-4 text-slate-400">{{ ord.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="p-4 font-bold text-brand-fuchsia-light font-mono">{{ ord.totalAmount | currency:'VND':'symbol':'1.0-0' }}</td>
                    <td class="p-4 text-slate-300 font-bold">{{ ord.paymentMethod }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-amber-500/20 text-amber-400': ord.status === 'PENDING',
                          'bg-blue-500/20 text-blue-400': ord.status === 'CONFIRMED',
                          'bg-cyan-500/20 text-cyan-400': ord.status === 'PREPARING',
                          'bg-indigo-500/20 text-indigo-400': ord.status === 'SHIPPING',
                          'bg-emerald-500/20 text-emerald-400': ord.status === 'DELIVERED',
                          'bg-rose-500/20 text-rose-400': ord.status === 'CANCELLED',
                          'bg-purple-500/20 text-purple-400': ord.status === 'RETURNED'
                        }"
                      >
                        {{ getStatusText(ord.status) }}
                      </span>
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex flex-wrap items-center justify-center gap-1.5 font-bold text-[10px]">
                        @if (ord.status === 'PENDING') {
                          <button (click)="changeStatus(ord, 'CONFIRMED')" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">Duyệt</button>
                          <button (click)="changeStatus(ord, 'CANCELLED')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded">Hủy</button>
                        }
                        @if (ord.status === 'CONFIRMED') {
                          <button (click)="changeStatus(ord, 'PREPARING')" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded">Đóng gói</button>
                        }
                        @if (ord.status === 'PREPARING') {
                          <button (click)="changeStatus(ord, 'SHIPPING')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Giao đi</button>
                        }
                        @if (ord.status === 'SHIPPING') {
                          <button (click)="changeStatus(ord, 'DELIVERED')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Giao Xong</button>
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
        }
      </div>

    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly orders = signal<OrderDTO[]>([]);
  readonly filteredOrders = signal<OrderDTO[]>([]);
  readonly isLoading = signal(false);
  readonly activeStatus = signal<string>('ALL');

  readonly filterStatuses = [
    { name: 'Tất Cả', value: 'ALL' },
    { name: 'Chờ Duyệt', value: 'PENDING' },
    { name: 'Xác Nhận', value: 'CONFIRMED' },
    { name: 'Đang Gói', value: 'PREPARING' },
    { name: 'Đang Giao', value: 'SHIPPING' },
    { name: 'Đã Giao', value: 'DELIVERED' },
    { name: 'Đã Hủy', value: 'CANCELLED' }
  ];

  // Mock list
  private readonly mockAdminOrders: OrderDTO[] = [
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
      userId: 2,
      shippingName: 'Thanh Thảo',
      shippingPhone: '0901234567',
      shippingProvince: 'Hà Nội',
      shippingDistrict: 'Hoàn Kiếm',
      shippingWard: 'Tràng Tiền',
      shippingStreet: '8 Tràng Tiền',
      subtotal: 450000,
      discountAmount: 0,
      shippingFee: 0,
      pointsUsed: 0,
      pointsAmount: 0,
      totalAmount: 450000,
      status: 'SHIPPING',
      paymentMethod: 'VNPAY',
      createdAt: '2026-05-19T14:30:00Z',
      updatedAt: '2026-05-20T10:00:00Z',
      items: [
        {
          id: 112,
          productId: 3,
          productName: 'Tinh chất Niacinamide 15% Dưỡng Sáng Mờ Thâm Sạm Brightening Booster',
          productSlug: 'tinh-chat-niacinamide-15-percent-brightening',
          primaryImageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=200',
          variantName: 'Chai 30ml',
          quantity: 1,
          price: 450000,
          totalPrice: 450000
        }
      ],
      statusHistory: []
    }
  ];

  ngOnInit(): void {
    this.loadOrdersData();
  }

  loadOrdersData() {
    this.isLoading.set(true);
    this.adminService.getAdminOrders().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data && res.data.content && res.data.content.length > 0) {
          this.orders.set(res.data.content);
        } else {
          this.orders.set(this.mockAdminOrders);
        }
        this.filterOrdersList();
      },
      error: () => {
        this.isLoading.set(false);
        this.orders.set(this.mockAdminOrders);
        this.filterOrdersList();
      }
    });
  }

  filterOrdersList() {
    const status = this.activeStatus();
    if (status === 'ALL') {
      this.filteredOrders.set(this.orders());
    } else {
      this.filteredOrders.set(this.orders().filter(o => o.status === status));
    }
  }

  selectStatus(status: string) {
    this.activeStatus.set(status);
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

  changeStatus(order: OrderDTO, nextStatus: OrderStatus) {
    const note = prompt(`Nhập ghi chú cập nhật trạng thái đơn hàng sang ${this.getStatusText(nextStatus)}:`);
    if (note === null) return;

    this.isLoading.set(true);
    this.adminService.updateOrderStatus(order.orderNumber, nextStatus, note).subscribe({
      next: () => {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        this.loadOrdersData();
      },
      error: () => {
        // Mock status update
        const list = this.orders().map(o => {
          if (o.orderNumber === order.orderNumber) {
            return { ...o, status: nextStatus };
          }
          return o;
        });
        this.orders.set(list);
        this.filterOrdersList();
        this.isLoading.set(false);
        alert('Đã cập nhật trạng thái đơn hàng!');
      }
    });
  }
}
