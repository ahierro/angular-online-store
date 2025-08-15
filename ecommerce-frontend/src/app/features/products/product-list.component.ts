import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Product, Category } from '../../core/services/api.service';

@Component({
	selector: 'app-product-list',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterLink],
	template: `
		<div class="toolbar">
			<input placeholder="Search" [(ngModel)]="query" (ngModelChange)="reload()"/>
			<select [(ngModel)]="selectedCategory" (ngModelChange)="reload()">
				<option [ngValue]="''">All Categories</option>
				<option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
			</select>
		</div>
		<div class="grid">
			<a class="card" *ngFor="let p of products()" [routerLink]="['/products', p.productId]">
				<img [src]="p.smallImageUrl" alt=""/>
				<div class="info">
					<h3>{{ p.productName }}</h3>
					<p>{{ p.price | currency }}</p>
				</div>
			</a>
		</div>
	`,
	styles: [`
		.toolbar { display: flex; gap: 8px; padding: 12px; }
		.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; padding: 12px; }
		.card { display: block; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.08); text-decoration: none; color: inherit; }
		.card img { width: 100%; height: 150px; object-fit: cover; }
		.card .info { padding: 10px; }
	`]
})
export class ProductListComponent implements OnInit {
	products = signal<Product[]>([]);
	categories = signal<Category[]>([]);
	page = 0;
	size = 20;
	selectedCategory: string = '';
	query: string = '';

	constructor(private api: ApiService) {}

	ngOnInit() {
		this.api.getCategoriesPaged({ page: 0, size: 100 }).subscribe(res => this.categories.set(res.content));
		this.reload();
	}

	reload() {
		this.api.getProductsPaged({ page: this.page, size: this.size, categoryId: this.selectedCategory || undefined, queryString: this.query || undefined })
			.subscribe(res => this.products.set(res.content));
	}
}