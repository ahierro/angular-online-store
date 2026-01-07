import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrderDTO } from '../../../models/api.models';

@Component({
  selector: 'app-purchase-order-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-order-details.component.html',
  styleUrl: './purchase-order-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOrderDetailsComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private order = signal<PurchaseOrderDTO | null>(null);
  private isLoading = signal(false);
  private isUpdatingStatus = signal(false);
  private selectedStatus = signal<string>('');

  orderData = this.order.asReadonly();
  loading = this.isLoading.asReadonly();
  updatingStatus = this.isUpdatingStatus.asReadonly();
  status = this.selectedStatus.asReadonly();

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetails(id);
    }
  }

  loadOrderDetails(id: string): void {
    this.isLoading.set(true);
    this.purchaseOrderService.getPurchaseOrder(id).subscribe({
      next: (orderDetails) => {
        this.order.set(orderDetails);
        this.selectedStatus.set(orderDetails.status);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin/purchase-orders']);
      }
    });
  }

  onStatusChange(newStatus: string): void {
    this.selectedStatus.set(newStatus);
  }

  confirmStatusUpdate(): void {
    const order = this.order();
    if (!order) {
      return;
    }

    this.isUpdatingStatus.set(true);
    this.purchaseOrderService
      .updatePurchaseOrder(order.id, { status: this.selectedStatus() })
      .subscribe({
        next: () => {
          this.isUpdatingStatus.set(false);
          // Reload order details to show updated status
          this.loadOrderDetails(order.id);
        },
        error: () => {
          this.isUpdatingStatus.set(false);
        }
      });
  }
}

