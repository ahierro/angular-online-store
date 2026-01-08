import { Component, signal, ChangeDetectionStrategy, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { ProductDTO, CategoryDTO } from '../../models/api.models';

interface CartItem {
  product: ProductDTO;
  quantity: number;
}

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  private products = signal<ProductDTO[]>([]);
  private categories = signal<CategoryDTO[]>([]);
  private cart = signal<CartItem[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private pageSize = signal(10);
  private isLoading = signal(false);
  private searchQuery = signal('');
  private selectedCategoryId = signal<string | null>(null);
  private sortByPrice = signal<'ASC' | 'DESC' | null>(null);

  productsList = this.products.asReadonly();
  categoriesList = this.categories.asReadonly();
  cartItems = this.cart.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  size = this.pageSize.asReadonly();
  loading = this.isLoading.asReadonly();
  search = this.searchQuery.asReadonly();
  selectedCategory = this.selectedCategoryId.asReadonly();
  sort = this.sortByPrice.asReadonly();

  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  });

  cartItemCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and pages around current
      pages.push(0);
      
      if (current > 2) {
        pages.push(-1); // Ellipsis marker
      }
      
      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 3) {
        pages.push(-1); // Ellipsis marker
      }
      
      pages.push(total - 1);
    }
    
    return pages;
  });

  isAdmin = this.authService.isAdmin;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadCartFromStorage();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      }
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService
      .getProducts({
        page: this.currentPage(),
        size: this.pageSize(),
        categoryId: this.selectedCategoryId() || undefined,
        queryString: this.searchQuery() || undefined,
        sortByPrice: this.sortByPrice() || undefined
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

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategoryId.set(categoryId === '' ? null : categoryId);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onSortChange(sort: string): void {
    this.sortByPrice.set(sort === '' ? null : (sort as 'ASC' | 'DESC'));
    this.currentPage.set(0);
    this.loadProducts();
  }

  addToCart(product: ProductDTO): void {
    const currentCart = this.cart();
    const existingItem = currentCart.find((item) => item.product.productId === product.productId);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        this.cart.set([...currentCart]);
      }
    } else {
      if (product.stock > 0) {
        this.cart.set([...currentCart, { product, quantity: 1 }]);
      }
    }

    this.saveCartToStorage();
  }

  removeFromCart(productId: string): void {
    this.cart.set(this.cart().filter((item) => item.product.productId !== productId));
    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cart().find((item) => item.product.productId === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else if (quantity <= item.product.stock) {
        item.quantity = quantity;
        this.cart.set([...this.cart()]);
        this.saveCartToStorage();
      }
    }
  }

  private loadCartFromStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        this.cart.set(JSON.parse(stored));
      } catch {
        this.cart.set([]);
      }
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart()));
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

