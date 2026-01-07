import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrderDTO, PurchaseOrderListItemDTO } from '../../../models/api.models';

@Component({
  selector: 'app-admin-purchase-orders',
  imports: [CommonModule],
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
  private selectedOrder = signal<PurchaseOrderDTO | null>(null);
  private showModal = signal(false);
  private isUpdatingStatus = signal(false);
  private isLoadingOrderDetails = signal(false);
  private selectedStatus = signal<string>('');

  ordersList = this.purchaseOrders.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  loading = this.isLoading.asReadonly();
  selected = this.selectedOrder.asReadonly();
  modalVisible = this.showModal.asReadonly();
  updatingStatus = this.isUpdatingStatus.asReadonly();
  loadingOrderDetails = this.isLoadingOrderDetails.asReadonly();
  status = this.selectedStatus.asReadonly();

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

  openOrderDetails(order: PurchaseOrderListItemDTO): void {
    this.isLoadingOrderDetails.set(true);
    this.showModal.set(true);
    this.selectedOrder.set(null);
    this.selectedStatus.set('');

    this.purchaseOrderService.getPurchaseOrder(order.id).subscribe({
      next: (orderDetails) => {
        this.selectedOrder.set(orderDetails);
        this.selectedStatus.set(orderDetails.status);
        this.isLoadingOrderDetails.set(false);
      },
      error: () => {
        this.isLoadingOrderDetails.set(false);
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedOrder.set(null);
    this.selectedStatus.set('');
  }

  onStatusChange(newStatus: string): void {
    this.selectedStatus.set(newStatus);
  }

  confirmStatusUpdate(): void {
    const order = this.selectedOrder();
    if (!order) {
      return;
    }

    this.isUpdatingStatus.set(true);
    this.purchaseOrderService
      .updatePurchaseOrder(order.id, { status: this.selectedStatus() })
      .subscribe({
        next: () => {
          this.isUpdatingStatus.set(false);
          this.loadPurchaseOrders();
          // Refresh selected order to show updated status
          this.purchaseOrderService.getPurchaseOrder(order.id).subscribe({
            next: (updatedOrder) => {
              this.selectedOrder.set(updatedOrder);
              this.selectedStatus.set(updatedOrder.status);
            }
          });
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

