import { Routes } from '@angular/router';
import { provideAuthGuard } from './core/guards/auth.guard';
import { provideAdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'products', pathMatch: 'full' },
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
	},
	{
		path: 'products',
		loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent)
	},
	{
		path: 'products/:id',
		loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent)
	},
	{
		path: 'admin/categories',
		canActivate: [provideAuthGuard(), provideAdminGuard()],
		loadComponent: () => import('./features/admin/categories/category-admin.component').then(m => m.CategoryAdminComponent)
	},
	{
		path: 'admin/products',
		canActivate: [provideAuthGuard(), provideAdminGuard()],
		loadComponent: () => import('./features/admin/products/product-admin.component').then(m => m.ProductAdminComponent)
	},
	{
		path: 'orders',
		canActivate: [provideAuthGuard()],
		loadComponent: () => import('./features/orders/order-list.component').then(m => m.OrderListComponent)
	},
	{
		path: 'orders/:id',
		canActivate: [provideAuthGuard()],
		loadComponent: () => import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent)
	},
	{ path: '**', redirectTo: 'products' }
];