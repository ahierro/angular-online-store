import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = '/api';

export interface PageRequestDTO { page: number; size: number }
export interface Category { id: string; name: string; description: string }
export interface Product { productId: string; productName: string; productDescription: string; price: number; stock: number; smallImageUrl: string; bigImageUrl: string; category?: Category }
export interface CategoryPage { content: Category[]; totalElements: number; totalPages: number; number: number }
export interface ProductPage { content: Product[]; totalElements: number; totalPages: number; number: number }
export interface PurchaseOrderLineCreationDTO { idProduct: string; quantity: number }
export interface PurchaseOrderCreationDTO { id: string; lines: PurchaseOrderLineCreationDTO[]; total: number }
export interface PurchaseOrderPatchDTO { status: 'PENDING'|'APPROVED'|'REJECTED'|'CANCELLED'|'DELIVERED' }
export interface PurchaseOrderView { id: string; idUser: string; total: number; status: string; createdAt: string; username: string; email: string; firstName: string; lastName: string }
export interface PurchaseOrderPage { content: PurchaseOrderView[]; totalElements: number; totalPages: number; number: number }

@Injectable({ providedIn: 'root' })
export class ApiService {
	constructor(private http: HttpClient) {}

	// Auth
	signup(payload: { username: string; password: string; email: string; firstName: string; lastName: string; admin?: boolean }) {
		return this.http.post(`${API}/signup`, payload);
	}

	// Products
	getProductsPaged(req: { page: number; size: number; categoryId?: string; queryString?: string; sortByPrice?: 'ASC'|'DESC' }): Observable<ProductPage> {
		let params = new HttpParams().set('page', req.page).set('size', req.size);
		if (req.categoryId) params = params.set('categoryId', req.categoryId);
		if (req.queryString) params = params.set('queryString', req.queryString);
		if (req.sortByPrice) params = params.set('sortByPrice', req.sortByPrice);
		return this.http.get<ProductPage>(`${API}/product/page`, { params });
	}

	getProduct(id: string): Observable<Product> {
		return this.http.get<Product>(`${API}/product/${id}`);
	}

	createProduct(payload: { productId: string; productName: string; productDescription: string; stock?: number; price?: number; smallImageUrl: string; bigImageUrl: string; categoryId: string }) {
		return this.http.post(`${API}/product`, payload);
	}

	updateProduct(id: string, payload: { productName: string; productDescription: string; stock?: number; price?: number; smallImageUrl: string; bigImageUrl: string; categoryId: string }) {
		return this.http.put(`${API}/product/${id}`, payload);
	}

	deleteProduct(id: string) { return this.http.delete(`${API}/product/${id}`); }

	// Categories
	getCategoriesPaged(req: PageRequestDTO): Observable<CategoryPage> {
		const params = new HttpParams().set('page', req.page).set('size', req.size);
		return this.http.get<CategoryPage>(`${API}/category/page`, { params });
	}

	getCategory(id: string): Observable<Category> {
		return this.http.get<Category>(`${API}/category/${id}`);
	}

	createCategory(payload: { id: string; name: string; description: string }) {
		return this.http.post(`${API}/category`, payload);
	}

	updateCategory(id: string, payload: { name: string; description: string }) {
		return this.http.put(`${API}/category/${id}`, payload);
	}

	deleteCategory(id: string) { return this.http.delete(`${API}/category/${id}`); }

	// Purchase Orders
	createPurchaseOrder(payload: PurchaseOrderCreationDTO) {
		return this.http.post(`${API}/purchase-order`, payload);
	}

	getPurchaseOrder(id: string) {
		return this.http.get(`${API}/purchase-order/${id}`);
	}

	getPurchaseOrdersPaged(req: PageRequestDTO): Observable<PurchaseOrderPage> {
		const params = new HttpParams().set('page', req.page).set('size', req.size);
		return this.http.get<PurchaseOrderPage>(`${API}/purchase-order/page`, { params });
	}

	patchPurchaseOrder(id: string, payload: PurchaseOrderPatchDTO) {
		return this.http.patch(`${API}/purchase-order/${id}`, payload);
	}
}