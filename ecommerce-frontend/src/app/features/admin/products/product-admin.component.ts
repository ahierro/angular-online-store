import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Product, Category } from '../../../core/services/api.service';

@Component({
	selector: 'app-product-admin',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="wrap">
			<h2>Products</h2>
			<form class="form" (ngSubmit)="save()">
				<input placeholder="Product ID" [(ngModel)]="form.productId" name="productId" required />
				<input placeholder="Name" [(ngModel)]="form.productName" name="productName" required />
				<input placeholder="Description" [(ngModel)]="form.productDescription" name="productDescription" required />
				<input type="number" placeholder="Stock" [(ngModel)]="form.stock" name="stock" />
				<input type="number" placeholder="Price" [(ngModel)]="form.price" name="price" step="0.01" />
				<input placeholder="Small Image URL" [(ngModel)]="form.smallImageUrl" name="smallImageUrl" required />
				<input placeholder="Big Image URL" [(ngModel)]="form.bigImageUrl" name="bigImageUrl" required />
				<select [(ngModel)]="form.categoryId" name="categoryId" required>
					<option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
				</select>
				<button type="submit">{{ editing ? 'Update' : 'Create' }}</button>
				<button type="button" (click)="reset()" *ngIf="editing">Cancel</button>
			</form>
			<div class="list">
				<div class="row" *ngFor="let p of products()">
					<div>{{ p.productId }}</div>
					<div>{{ p.productName }}</div>
					<div>{{ p.price | currency }}</div>
					<div>
						<button (click)="edit(p)">Edit</button>
						<button (click)="remove(p)">Delete</button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
		.wrap { padding: 16px; display: grid; gap: 12px; }
		.form { display: grid; grid-template-columns: repeat(8, 1fr) auto auto; gap: 8px; align-items: center; }
		.list { display: grid; gap: 6px; }
		.row { display: grid; grid-template-columns: 2fr 3fr 1fr auto; gap: 8px; background: white; padding: 8px; border-radius: 6px; align-items: center; }
	`]
})
export class ProductAdminComponent implements OnInit {
	products = signal<Product[]>([]);
	categories = signal<Category[]>([]);
	form: any = { productId: '', productName: '', productDescription: '', stock: 0, price: 0, smallImageUrl: '', bigImageUrl: '', categoryId: '' };
	editing = false;

	constructor(private api: ApiService) {}

	ngOnInit() {
		this.api.getCategoriesPaged({ page: 0, size: 100 }).subscribe(res => this.categories.set(res.content));
		this.load();
	}

	load() {
		this.api.getProductsPaged({ page: 0, size: 100 }).subscribe(res => this.products.set(res.content));
	}

	save() {
		if (this.editing) {
			this.api.updateProduct(this.form.productId, {
				productName: this.form.productName,
				productDescription: this.form.productDescription,
				stock: this.form.stock,
				price: this.form.price,
				smallImageUrl: this.form.smallImageUrl,
				bigImageUrl: this.form.bigImageUrl,
				categoryId: this.form.categoryId,
			}).subscribe(() => { this.reset(); this.load(); });
		} else {
			this.api.createProduct({
				productId: this.form.productId,
				productName: this.form.productName,
				productDescription: this.form.productDescription,
				stock: this.form.stock,
				price: this.form.price,
				smallImageUrl: this.form.smallImageUrl,
				bigImageUrl: this.form.bigImageUrl,
				categoryId: this.form.categoryId,
			}).subscribe(() => { this.reset(); this.load(); });
		}
	}

	edit(p: Product) {
		this.form = { ...p, categoryId: p.category?.id ?? this.form.categoryId };
		this.editing = true;
	}

	remove(p: Product) {
		if (!confirm('Delete product?')) return;
		this.api.deleteProduct(p.productId).subscribe(() => this.load());
	}

	reset() {
		this.form = { productId: '', productName: '', productDescription: '', stock: 0, price: 0, smallImageUrl: '', bigImageUrl: '', categoryId: '' };
		this.editing = false;
	}
}