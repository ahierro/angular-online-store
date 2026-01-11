import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrderDTO } from '../../models/api.models';

@Component({
  selector: 'app-my-order-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-order-details.component.html',
  styleUrl: './my-order-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyOrderDetailsComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private order = signal<PurchaseOrderDTO | null>(null);
  private isLoading = signal(false);

  orderData = this.order.asReadonly();
  loading = this.isLoading.asReadonly();

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
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/my-orders']);
      }
    });
  }
}
