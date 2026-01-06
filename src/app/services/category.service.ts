import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  CategoryDTO,
  CategoryCreationDTO,
  CategoryUpdateDTO,
  CategoryPage,
  PageRequestDTO
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = 'http://localhost:8080/api/category';

  constructor(private http: HttpClient) {}

  getCategories(request: PageRequestDTO): Observable<CategoryPage> {
    const params = new HttpParams()
      .set('page', request.page.toString())
      .set('size', request.size.toString());

    return this.http.get<CategoryPage>(`${this.API_URL}/page`, { params });
  }

  getAllCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryPage>(`${this.API_URL}/page`, {
      params: new HttpParams().set('page', '0').set('size', '1000')
    }).pipe(
      map((page) => page.content)
    );
  }

  getCategory(id: string): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(`${this.API_URL}/${id}`);
  }

  createCategory(category: CategoryCreationDTO): Observable<void> {
    return this.http.post<void>(this.API_URL, category);
  }

  updateCategory(id: string, category: CategoryUpdateDTO): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}

