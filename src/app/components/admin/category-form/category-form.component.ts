import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { CategoryCreationDTO, CategoryUpdateDTO } from '../../../models/api.models';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFormComponent implements OnInit {
  private categoryService = inject(CategoryService);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  private isLoading = signal(false);
  private errorMessage = signal<string | null>(null);
  private isEditMode = signal(false);
  private categoryId = signal<string | null>(null);

  loading = this.isLoading.asReadonly();
  error = this.errorMessage.asReadonly();
  editMode = this.isEditMode.asReadonly();

  categoryForm = this.fb.group({
    id: ['', [Validators.required, Validators.minLength(1)]],
    name: ['', [Validators.required, Validators.minLength(1)]],
    description: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.categoryId.set(id);
      this.loadCategory(id);
    } else {
      this.isEditMode.set(false);
    }
  }

  loadCategory(id: string): void {
    this.isLoading.set(true);
    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          id: category.id,
          name: category.name,
          description: category.description
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load category');
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.categoryForm.value;

    if (this.isEditMode()) {
      const updateData: CategoryUpdateDTO = {
        name: formValue.name!,
        description: formValue.description!
      };

      this.categoryService.updateCategory(this.categoryId()!, updateData).subscribe({
        next: () => {
          this.router.navigate(['/admin/categories']);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to update category');
        }
      });
    } else {
      const createData: CategoryCreationDTO = {
        id: formValue.id!,
        name: formValue.name!,
        description: formValue.description!
      };

      this.categoryService.createCategory(createData).subscribe({
        next: () => {
          this.router.navigate(['/admin/categories']);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to create category');
        }
      });
    }
  }
}

