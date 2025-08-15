import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterOutlet],
	template: `
		<header class="topbar">
			<nav class="nav">
				<a routerLink="/products">Products</a>
				<a routerLink="/orders" *ngIf="auth.isAuthenticated()">Orders</a>
				<a routerLink="/admin/categories" *ngIf="auth.isAdmin()">Admin Categories</a>
				<a routerLink="/admin/products" *ngIf="auth.isAdmin()">Admin Products</a>
				<span class="spacer"></span>
				<span *ngIf="auth.isAuthenticated()">Hello, {{ auth.username() }}</span>
				<button *ngIf="auth.isAuthenticated()" (click)="logout()">Logout</button>
				<a routerLink="/login" *ngIf="!auth.isAuthenticated()">Login</a>
			</nav>
		</header>
		<div class="app-shell">
			<router-outlet />
		</div>
	`,
	styles: [`
		.topbar { background: #fff; border-bottom: 1px solid #eee; }
		.nav { display: flex; gap: 12px; align-items: center; padding: 10px 16px; }
		.nav a { text-decoration: none; color: #1976d2; }
		.spacer { flex: 1; }
		.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
		button { padding: 6px 10px; }
	`]
})
export class AppComponent {
	constructor(public auth: AuthService) {}
	logout() { this.auth.logout(); }
}
