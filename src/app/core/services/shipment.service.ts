import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';
import { ShipmentDTO } from '../models/shipment.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  private readonly api = inject(ApiService);

  getMyShipments(page = 0, size = 10): Observable<ApiResponse<ShipmentDTO[]>> {
    return this.api.get<ShipmentDTO[]>('/api/v1/shipments/mine', { page, size });
  }

  getShipmentByOrder(orderNumber: string): Observable<ApiResponse<ShipmentDTO>> {
    return this.api.get<ShipmentDTO>(`/api/v1/shipments/by-order/${orderNumber}`);
  }
}
