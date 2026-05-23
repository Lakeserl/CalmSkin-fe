import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import {
  CreateOrderRequest,
  OrderDTO,
  OrderSummaryDTO,
  ReturnOrderRequest,
} from '../models/order.model';

/** Subset of Spring's `Page<T>` JSON, as serialised by order-service. */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface VietnamRegion {
  name: string;
  districts: {
    name: string;
    wards: string[];
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<OrderDTO>> {
    return this.api.post<OrderDTO>('/api/v1/orders', request);
  }

  getOrderDetail(orderNumber: string): Observable<ApiResponse<OrderDTO>> {
    return this.api.get<OrderDTO>(`/api/v1/orders/${orderNumber}`);
  }

  getUserOrders(
    status?: string,
    page = 0,
    size = 10,
  ): Observable<ApiResponse<SpringPage<OrderSummaryDTO>>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    return this.api.get<SpringPage<OrderSummaryDTO>>('/api/v1/orders', params);
  }

  cancelOrder(orderNumber: string, reason: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(`/api/v1/orders/${orderNumber}/cancel`, { reason });
  }

  requestReturn(
    orderNumber: string,
    data: ReturnOrderRequest,
  ): Observable<ApiResponse<void>> {
    return this.api.post<void>(`/api/v1/orders/${orderNumber}/return`, data);
  }

  // Vietnamese Address Helper Data
  getVietnamRegions(): VietnamRegion[] {
    return [
      {
        name: 'Hồ Chí Minh',
        districts: [
          { name: 'Quận 1', wards: ['Bến Nghé', 'Bến Thành', 'Cô Giang', 'Đa Kao', 'Tân Định'] },
          { name: 'Quận 3', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Võ Thị Sáu'] },
          { name: 'Quận 7', wards: ['Tân Kiểng', 'Tân Phong', 'Tân Phú', 'Tân Quy', 'Phú Mỹ'] },
          { name: 'Bình Thạnh', wards: ['Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 25'] },
          { name: 'Thành phố Thủ Đức', wards: ['Thảo Điền', 'An Phú', 'Bình An', 'Linh Tây', 'Thủ Thiêm'] }
        ]
      },
      {
        name: 'Hà Nội',
        districts: [
          { name: 'Hoàn Kiếm', wards: ['Hàng Bạc', 'Hàng Bông', 'Hàng Đào', 'Tràng Tiền', 'Lý Thái Tổ'] },
          { name: 'Ba Đình', wards: ['Trúc Bạch', 'Điện Biên', 'Giảng Võ', 'Kim Mã', 'Cống Vị'] },
          { name: 'Cầu Giấy', wards: ['Dịch Vọng', 'Nghĩa Tân', 'Quan Hoa', 'Trung Hòa', 'Yên Hòa'] },
          { name: 'Đống Đa', wards: ['Cát Linh', 'Khương Thượng', 'Láng Hạ', 'Quang Trung', 'Ô Chợ Dừa'] }
        ]
      },
      {
        name: 'Đà Nẵng',
        districts: [
          { name: 'Hải Châu', wards: ['Hòa Cường Bắc', 'Hòa Cường Nam', 'Nam Dương', 'Thạch Thang', 'Phước Ninh'] },
          { name: 'Thanh Khê', wards: ['Vĩnh Trung', 'Tân Chính', 'Thạc Gián', 'Chính Gián', 'Hòa Khê'] },
          { name: 'Sơn Trà', wards: ['An Hải Bắc', 'An Hải Tây', 'Mân Thái', 'Thọ Quang', 'Phước Mỹ'] }
        ]
      },
      {
        name: 'Cần Thơ',
        districts: [
          { name: 'Ninh Kiều', wards: ['An Hội', 'An Khánh', 'An Lạc', 'An Nghiệp', 'Xuân Khánh'] },
          { name: 'Cái Răng', wards: ['Lê Bình', 'Hưng Phú', 'Hưng Thạnh', 'Ba Láng'] }
        ]
      }
    ];
  }
}
