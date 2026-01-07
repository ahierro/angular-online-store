import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { AlertService } from '../../../services/alert.service';
import { CategoryDTO } from '../../../models/api.models';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private alertService = inject(AlertService);

  private categories = signal<CategoryDTO[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private isLoading = signal(false);
  private showDeleteModal = signal(false);
  private itemToDelete = signal<{ id: string; name: string } | null>(null);

  categoriesList = this.categories.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  loading = this.isLoading.asReadonly();
  deleteModalVisible = this.showDeleteModal.asReadonly();
  deleteItem = this.itemToDelete.asReadonly();

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService
      .getCategories({
        page: this.currentPage(),
        size: 10
      })
      .subscribe({
        next: (response) => {
          this.categories.set(response.content);
          this.currentPage.set(response.number);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  openDeleteModal(category: CategoryDTO): void {
    this.itemToDelete.set({ id: category.id, name: category.name });
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

    this.categoryService.deleteCategory(item.id).subscribe({
      next: () => {
        this.alertService.success('Category deleted successfully');
        this.closeDeleteModal();
        this.loadCategories();
      },
      error: () => {
        this.alertService.error('Failed to delete category');
        this.closeDeleteModal();
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCategories();
  }
}

