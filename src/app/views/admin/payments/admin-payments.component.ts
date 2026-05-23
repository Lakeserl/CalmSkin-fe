import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentDTO, PaymentStatusCode } from '../../../core/models/payment.model';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in text-slate-100">

      <div class="border-b border-slate-800 pb-5">
        <h1 class="text-3xl font-serif font-bold text-white">Quản Lý Thanh Toán</h1>
        <p class="text-xs text-slate-400 mt-1">Theo dõi giao dịch cổng thanh toán VNPay / MoMo / COD và xử lý hoàn tiền.</p>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
        @if (isLoading()) {
          <div class="p-20 text-center text-slate-400">Đang tải danh sách thanh toán...</div>
        } @else if (errorMessage()) {
          <div class="p-16 text-center space-y-3">
            <p class="text-rose-400">{{ errorMessage() }}</p>
            <button (click)="loadPayments()" class="px-4 py-2 bg-brand-fuchsia text-white rounded-full text-xs font-bold">Thử lại</button>
          </div>
        } @else if (payments().length === 0) {
          <div class="p-20 text-center text-slate-400">Chưa có giao dịch thanh toán nào.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 font-bold bg-slate-950 text-slate-400">
                  <th class="p-4">Mã Thanh Toán</th>
                  <th class="p-4">Đơn Hàng</th>
                  <th class="p-4">Số Tiền</th>
                  <th class="p-4">Đã Hoàn</th>
                  <th class="p-4">Cổng</th>
                  <th class="p-4">Trạng Thái</th>
                  <th class="p-4">Thanh Toán Lúc</th>
                  <th class="p-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                @for (pay of payments(); track pay.id) {
                  <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                    <td class="p-4 font-mono font-bold text-white">{{ pay.paymentNumber }}</td>
                    <td class="p-4 font-mono text-slate-300">{{ pay.orderNumber }}</td>
                    <td class="p-4 font-bold text-brand-fuchsia-light font-mono">{{ pay.amount | currency:'VND':'symbol':'1.0-0' }}</td>
                    <td class="p-4 text-slate-400 font-mono">{{ pay.refundedAmount | currency:'VND':'symbol':'1.0-0' }}</td>
                    <td class="p-4 text-slate-300 font-bold">{{ pay.method }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider" [ngClass]="statusClass(pay.status)">
                        {{ getStatusText(pay.status) }}
                      </span>
                    </td>
                    <td class="p-4 text-slate-400">{{ pay.paidAt ? (pay.paidAt | date:'dd/MM/yyyy HH:mm') : '—' }}</td>
                    <td class="p-4 text-center">
                      @if (canRefund(pay)) {
                        <button (click)="refund(pay)" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px]">Hoàn Tiền</button>
                      } @else {
                        <span class="text-slate-500">—</span>
                      }
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
export class AdminPaymentsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);

  readonly payments = signal<PaymentDTO[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly errorMessage = signal('');
  readonly hasNext = signal(false);

  private currentPage = 0;
  private readonly pageSize = 15;

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
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
    this.paymentService.getAllPayments(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        if (res.success && res.data) {
          this.payments.set(append ? [...this.payments(), ...res.data] : res.data);
          this.hasNext.set(res.page?.hasNext ?? false);
        } else {
          this.errorMessage.set(res.message || 'Đã xảy ra lỗi.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        this.errorMessage.set(err.message || 'Không thể tải danh sách thanh toán.');
      },
    });
  }

  canRefund(pay: PaymentDTO): boolean {
    return (pay.status === 'COMPLETED' || pay.status === 'PARTIALLY_REFUNDED')
      && pay.refundedAmount < pay.amount;
  }

  refund(pay: PaymentDTO): void {
    const remaining = pay.amount - pay.refundedAmount;
    const raw = prompt(
      `Nhập số tiền hoàn (tối đa ${remaining.toLocaleString('vi-VN')}đ, tối thiểu 1.000đ):`,
      String(remaining),
    );
    if (raw === null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 1000 || amount > remaining) {
      alert('Số tiền hoàn không hợp lệ.');
      return;
    }
    const reason = prompt('Nhập lý do hoàn tiền:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do hoàn tiền!');
      return;
    }

    this.isLoading.set(true);
    this.paymentService.refundPayment(pay.paymentNumber, { amount, reason }).subscribe({
      next: () => {
        alert('Đã tạo yêu cầu hoàn tiền thành công.');
        this.loadPayments();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.message || 'Hoàn tiền thất bại.');
      },
    });
  }

  getStatusText(status: PaymentStatusCode): string {
    const map: Record<PaymentStatusCode, string> = {
      PENDING: 'Chờ thanh toán',
      COMPLETED: 'Thành công',
      FAILED: 'Thất bại',
      CANCELLED: 'Đã hủy',
      EXPIRED: 'Hết hạn',
      REFUNDED: 'Đã hoàn tiền',
      PARTIALLY_REFUNDED: 'Hoàn một phần',
    };
    return map[status] || status;
  }

  statusClass(status: PaymentStatusCode): Record<string, boolean> {
    return {
      'bg-amber-500/20 text-amber-400': status === 'PENDING',
      'bg-emerald-500/20 text-emerald-400': status === 'COMPLETED',
      'bg-rose-500/20 text-rose-400': status === 'FAILED',
      'bg-slate-500/20 text-slate-300': status === 'CANCELLED' || status === 'EXPIRED',
      'bg-purple-500/20 text-purple-400': status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED',
    };
  }
}
