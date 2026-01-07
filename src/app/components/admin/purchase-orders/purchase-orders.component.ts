import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrderListItemDTO } from '../../../models/api.models';

@Component({
  selector: 'app-admin-purchase-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPurchaseOrdersComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);

  private purchaseOrders = signal<PurchaseOrderListItemDTO[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private isLoading = signal(false);

  ordersList = this.purchaseOrders.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  loading = this.isLoading.asReadonly();

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.isLoading.set(true);
    this.purchaseOrderService
      .getPurchaseOrders({
        page: this.currentPage(),
        size: 10
      })
      .subscribe({
        next: (response) => {
          this.purchaseOrders.set(response.content);
          this.currentPage.set(response.number);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPurchaseOrders();
  }
}

