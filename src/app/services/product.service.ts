import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductDTO,
  ProductCreationDTO,
  ProductUpdateDTO,
  ProductPage,
  ProductPageRequestDTO
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8080/api/product';

  constructor(private http: HttpClient) {}

  getProducts(request: ProductPageRequestDTO): Observable<ProductPage> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('size', request.size.toString());

    if (request.categoryId) {
      params = params.set('pageRequest.categoryId', request.categoryId);
    }
    if (request.queryString) {
      params = params.set('pageRequest.queryString', request.queryString);
    }
    if (request.sortByPrice) {
      params = params.set('pageRequest.sortByPrice', request.sortByPrice);
    }

    return this.http.get<ProductPage>(`${this.API_URL}/page`, { params });
  }

  getProduct(id: string): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.API_URL}/${id}`);
  }

  createProduct(product: ProductCreationDTO): Observable<void> {
    return this.http.post<void>(this.API_URL, product);
  }

  updateProduct(id: string, product: ProductUpdateDTO): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}

