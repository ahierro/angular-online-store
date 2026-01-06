import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
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

  private categories = signal<CategoryDTO[]>([]);
  private currentPage = signal(0);
  private totalPages = signal(0);
  private isLoading = signal(false);

  categoriesList = this.categories.asReadonly();
  page = this.currentPage.asReadonly();
  total = this.totalPages.asReadonly();
  loading = this.isLoading.asReadonly();

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

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
        }
      });
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCategories();
  }
}

