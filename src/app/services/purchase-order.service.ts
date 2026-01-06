import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PurchaseOrderDTO,
  PurchaseOrderCreationDTO,
  PurchaseOrderPage,
  PageRequestDTO
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private readonly API_URL = 'http://localhost:8080/api/purchase-order';

  constructor(private http: HttpClient) {}

  createPurchaseOrder(order: PurchaseOrderCreationDTO): Observable<void> {
    return this.http.post<void>(this.API_URL, order);
  }

  getPurchaseOrder(id: string): Observable<PurchaseOrderDTO> {
    return this.http.get<PurchaseOrderDTO>(`${this.API_URL}/${id}`);
  }

  getPurchaseOrders(request: PageRequestDTO): Observable<PurchaseOrderPage> {
    const params = new HttpParams()
      .set('page', request.page.toString())
      .set('size', request.size.toString());

    return this.http.get<PurchaseOrderPage>(`${this.API_URL}/page`, { params });
  }
}

