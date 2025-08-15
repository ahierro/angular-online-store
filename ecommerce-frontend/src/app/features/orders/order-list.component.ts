import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, PurchaseOrderPage } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
	selector: 'app-order-list',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `
		<div class="orders">
			<h2>Purchase Orders</h2>
			<div class="toolbar">
				<button routerLink="/products">Shop more</button>
				<button (click)="createOrder()">Create order from cart</button>
			</div>
			<div class="list">
				<a class="row" *ngFor="let o of orders()" [routerLink]="['/orders', o.id]">
					<div>#{{ o.id }}</div>
					<div>{{ o.username }} ({{ o.email }})</div>
					<div>{{ o.total | currency }}</div>
					<div class="status">{{ o.status }}</div>
				</a>
			</div>
		</div>
	`,
	styles: [`
		.orders { padding: 16px; }
		.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
		.list { display: grid; gap: 8px; }
		.row { display: grid; grid-template-columns: 2fr 3fr 1fr 1fr; align-items: center; gap: 8px; background: white; padding: 10px; border-radius: 6px; text-decoration: none; color: inherit; }
		.status { text-transform: capitalize; }
		button { padding: 8px 10px; }
	`]
})
export class OrderListComponent implements OnInit {
	orders = signal<PurchaseOrderPage['content']>([]);
	page = 0; size = 20;

	constructor(private api: ApiService, private auth: AuthService) {}

	ngOnInit() {
		this.load();
	}

	load() {
		this.api.getPurchaseOrdersPaged({ page: this.page, size: this.size }).subscribe(res => this.orders.set(res.content));
	}

	createOrder() {
		const cart: Record<string, number> = JSON.parse(localStorage.getItem('cart') || '{}');
		const entries = Object.entries(cart);
		if (entries.length === 0) { alert('Cart is empty'); return; }
		// Compute total by fetching product prices
		import('rxjs').then(({ forkJoin }) => {
			forkJoin(entries.map(([idProduct, quantity]) => this.api.getProduct(idProduct).pipe())).subscribe({
				next: (products) => {
					const lines = entries.map(([idProduct, quantity]) => ({ idProduct, quantity }));
					const total = products.reduce((sum, p, idx) => sum + p.price * entries[idx][1], 0);
					const id = crypto.randomUUID();
					this.api.createPurchaseOrder({ id, lines, total }).subscribe({
						next: () => { localStorage.removeItem('cart'); this.load(); },
						error: () => alert('Failed to create order')
					});
				},
				error: () => alert('Failed to compute total')
			});
		});
	}
}