import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrderDTO } from '../../../models/api.models';

@Component({
  selector: 'app-admin-purchase-orders',
  imports: [CommonModule],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPurchaseOrdersComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);

  private purchaseOrders = signal<PurchaseOrderDTO[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private isLoading = signal(false);
  private selectedOrder = signal<PurchaseOrderDTO | null>(null);
  private showModal = signal(false);
  private isUpdatingStatus = signal(false);

  ordersList = this.purchaseOrders.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  loading = this.isLoading.asReadonly();
  selected = this.selectedOrder.asReadonly();
  modalVisible = this.showModal.asReadonly();
  updatingStatus = this.isUpdatingStatus.asReadonly();

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

  openOrderDetails(order: PurchaseOrderDTO): void {
    this.selectedOrder.set(order);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedOrder.set(null);
  }

  updateStatus(orderId: string, newStatus: string): void {
    this.isUpdatingStatus.set(true);
    this.purchaseOrderService
      .updatePurchaseOrderStatus(orderId, { status: newStatus })
      .subscribe({
        next: () => {
          this.isUpdatingStatus.set(false);
          this.loadPurchaseOrders();
          // Update selected order if it's the one being updated
          const currentSelected = this.selectedOrder();
          if (currentSelected && currentSelected.id === orderId) {
            this.selectedOrder.set({
              ...currentSelected,
              status: newStatus
            });
          }
        },
        error: () => {
          this.isUpdatingStatus.set(false);
        }
      });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPurchaseOrders();
  }
}

