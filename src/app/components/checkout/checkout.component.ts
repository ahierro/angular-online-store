import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrderLineCreationDTO } from '../../models/api.models';

interface CartItem {
  product: {
    productId: string;
    productName: string;
    price: number;
  };
  quantity: number;
}

@Component({
  selector: 'app-checkout',
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent implements OnInit {
  private purchaseOrderService = inject(PurchaseOrderService);
  private router = inject(Router);

  private cart = signal<CartItem[]>([]);
  private isLoading = signal(false);
  private errorMessage = signal<string | null>(null);
  private successMessage = signal<string | null>(null);

  cartItems = this.cart.asReadonly();
  loading = this.isLoading.asReadonly();
  error = this.errorMessage.asReadonly();
  success = this.successMessage.asReadonly();

  total = signal(0);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const cart = JSON.parse(stored);
        this.cart.set(cart);
        this.calculateTotal();
      } catch {
        this.cart.set([]);
      }
    }

    if (this.cart().length === 0) {
      this.router.navigate(['/products']);
    }
  }

  calculateTotal(): void {
    const total = this.cart().reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    this.total.set(total);
  }

  createOrder(): void {
    if (this.cart().length === 0) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const orderId = `ORDER-${Date.now()}`;
    const lines: PurchaseOrderLineCreationDTO[] = this.cart().map((item) => ({
      idProduct: item.product.productId,
      quantity: item.quantity
    }));

    const order = {
      id: orderId,
      lines,
      total: this.total()
    };

    this.purchaseOrderService.createPurchaseOrder(order).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Purchase order created successfully!');
        localStorage.removeItem('cart');
        this.cart.set([]);
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to create purchase order. Please try again.'
        );
      }
    });
  }
}

