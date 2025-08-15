import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
	selector: 'app-order-detail',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="order-detail" *ngIf="order() as o">
			<h2>Order #{{ o.id }}</h2>
			<div class="meta">
				<div>User: {{ (o.user?.username || o.username) }} ({{ (o.user?.email || o.email) }})</div>
				<div>Total: {{ o.total | currency }}</div>
				<div>Status: <strong>{{ o.status }}</strong></div>
			</div>
			<div *ngIf="isAdmin()" class="admin">
				<label>Update Status:
					<select #st>
						<option value="PENDING">PENDING</option>
						<option value="APPROVED">APPROVED</option>
						<option value="REJECTED">REJECTED</option>
						<option value="CANCELLED">CANCELLED</option>
						<option value="DELIVERED">DELIVERED</option>
					</select>
				</label>
				<button (click)="updateStatus(st.value)">Save</button>
			</div>
		</div>
	`,
	styles: [`
		.order-detail { padding: 16px; display: grid; gap: 12px; }
		.meta { display: grid; gap: 6px; }
		.admin { display: flex; gap: 8px; align-items: center; }
	`]
})
export class OrderDetailComponent implements OnInit {
	order = signal<any>(null);

	constructor(private route: ActivatedRoute, private api: ApiService, private auth: AuthService) {}

	ngOnInit() {
		const id = this.route.snapshot.paramMap.get('id')!;
		this.api.getPurchaseOrder(id).subscribe(o => this.order.set(o));
	}

	isAdmin() { return this.auth.isAdmin(); }

	updateStatus(status: string) {
		const id = this.route.snapshot.paramMap.get('id')!;
		this.api.patchPurchaseOrder(id, { status: status as any }).subscribe(() => {
			const o = this.order();
			this.order.set({ ...o, status });
		});
	}
}