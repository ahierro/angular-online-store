import { Component, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { ProductCreationDTO, ProductUpdateDTO, CategoryDTO } from '../../../models/api.models';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  private categories = signal<CategoryDTO[]>([]);
  private isLoading = signal(false);
  private errorMessage = signal<string | null>(null);
  private isEditMode = signal(false);
  private productId = signal<string | null>(null);

  categoriesList = this.categories.asReadonly();
  loading = this.isLoading.asReadonly();
  error = this.errorMessage.asReadonly();
  editMode = this.isEditMode.asReadonly();

  productForm = this.fb.group({
    productId: ['', [Validators.required, this.uuidValidator]],
    productName: ['', [Validators.required, Validators.minLength(1)]],
    productDescription: ['', [Validators.required, Validators.minLength(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    smallImageUrl: ['', [Validators.required, Validators.minLength(1)]],
    bigImageUrl: ['', [Validators.required, Validators.minLength(1)]],
    categoryId: ['', [Validators.required, Validators.minLength(1)]]
  });

  private uuidValidator(control: { value: string }): { [key: string]: boolean } | null {
    if (!control.value) {
      return null;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(control.value) ? null : { invalidUuid: true };
  }

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    } else {
      this.isEditMode.set(false);
      this.generateUUID();
    }
  }

  generateUUID(): void {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      this.productForm.patchValue({ productId: crypto.randomUUID() });
    } else {
      // Fallback for environments without crypto.randomUUID
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      this.productForm.patchValue({ productId: uuid });
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          productId: product.productId,
          productName: product.productName,
          productDescription: product.productDescription,
          stock: product.stock,
          price: product.price,
          smallImageUrl: product.smallImageUrl,
          bigImageUrl: product.bigImageUrl,
          categoryId: product.category.id
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load product');
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.productForm.value;

    if (this.isEditMode()) {
      const updateData: ProductUpdateDTO = {
        productName: formValue.productName!,
        productDescription: formValue.productDescription!,
        stock: formValue.stock!,
        price: formValue.price!,
        smallImageUrl: formValue.smallImageUrl!,
        bigImageUrl: formValue.bigImageUrl!,
        categoryId: formValue.categoryId!
      };

      this.productService.updateProduct(this.productId()!, updateData).subscribe({
        next: () => {
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to update product');
        }
      });
    } else {
      const createData: ProductCreationDTO = {
        productId: formValue.productId!,
        productName: formValue.productName!,
        productDescription: formValue.productDescription!,
        stock: formValue.stock!,
        price: formValue.price!,
        smallImageUrl: formValue.smallImageUrl!,
        bigImageUrl: formValue.bigImageUrl!,
        categoryId: formValue.categoryId!
      };

      this.productService.createProduct(createData).subscribe({
        next: () => {
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to create product');
        }
      });
    }
  }
}

