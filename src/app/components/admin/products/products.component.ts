import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ProductDTO } from '../../../models/api.models';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);

  private products = signal<ProductDTO[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private isLoading = signal(false);

  productsList = this.products.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  loading = this.isLoading.asReadonly();

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService
      .getProducts({
        page: this.currentPage(),
        size: 10
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.content);
          this.currentPage.set(response.number);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        }
      });
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }
}

