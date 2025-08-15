import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, Product } from '../../core/services/api.service';

@Component({
	selector: 'app-product-detail',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div *ngIf="product() as p" class="detail">
			<img [src]="p.bigImageUrl" alt=""/>
			<div class="info">
				<h1>{{ p.productName }}</h1>
				<p>{{ p.productDescription }}</p>
				<p class="price">{{ p.price | currency }}</p>
				<button (click)="addToCart(p.productId)">Add to order</button>
			</div>
		</div>
	`,
	styles: [`
		.detail { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; }
		.detail img { width: 100%; border-radius: 8px; }
		.price { font-size: 20px; font-weight: 600; }
		button { padding: 10px 12px; background: var(--primary); color: white; border: none; cursor: pointer; }
	`]
})
export class ProductDetailComponent implements OnInit {
	product = signal<Product | null>(null);

	constructor(private route: ActivatedRoute, private api: ApiService) {}

	ngOnInit() {
		const id = this.route.snapshot.paramMap.get('id')!;
		this.api.getProduct(id).subscribe(p => this.product.set(p));
	}

	addToCart(productId: string) {
		// For brevity: store in localStorage interim cart
		const cart: Record<string, number> = JSON.parse(localStorage.getItem('cart') || '{}');
		cart[productId] = (cart[productId] || 0) + 1;
		localStorage.setItem('cart', JSON.stringify(cart));
		alert('Added to order');
	}
}