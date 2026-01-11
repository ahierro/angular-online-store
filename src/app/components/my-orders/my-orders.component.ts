import { Component, signal, ChangeDetectionStrategy, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrderListItemDTO } from '../../models/api.models';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyOrdersComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);

  private purchaseOrders = signal<PurchaseOrderListItemDTO[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private pageSize = signal(10);
  private isLoading = signal(false);

  ordersList = this.purchaseOrders.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  size = this.pageSize.asReadonly();
  loading = this.isLoading.asReadonly();

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      
      if (current > 2) {
        pages.push(-1);
      }
      
      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 3) {
        pages.push(-1);
      }
      
      pages.push(total - 1);
    }
    
    return pages;
  });

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.isLoading.set(true);
    this.purchaseOrderService
      .getPurchaseOrders({
        page: this.currentPage(),
        size: this.pageSize()
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

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadPurchaseOrders();
  }
}
