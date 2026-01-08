import { Component, signal, ChangeDetectionStrategy, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { AlertService } from '../../../services/alert.service';
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
  private alertService = inject(AlertService);

  private products = signal<ProductDTO[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private pageSize = signal(10);
  private isLoading = signal(false);
  private showDeleteModal = signal(false);
  private itemToDelete = signal<{ id: string; name: string } | null>(null);

  productsList = this.products.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  size = this.pageSize.asReadonly();
  loading = this.isLoading.asReadonly();
  deleteModalVisible = this.showDeleteModal.asReadonly();
  deleteItem = this.itemToDelete.asReadonly();

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
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService
      .getProducts({
        page: this.currentPage(),
        size: this.pageSize()
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

  openDeleteModal(product: ProductDTO): void {
    this.itemToDelete.set({ id: product.productId, name: product.productName });
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) {
      return;
    }

    this.productService.deleteProduct(item.id).subscribe({
      next: () => {
        this.alertService.success('Product deleted successfully');
        this.closeDeleteModal();
        this.loadProducts();
      },
      error: () => {
        this.alertService.error('Failed to delete product');
        this.closeDeleteModal();
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadProducts();
  }
}

