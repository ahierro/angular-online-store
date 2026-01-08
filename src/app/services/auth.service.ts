import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, RegisterUserDTO, UserInfo } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userSignal = signal<UserInfo | null>(this.getStoredUser());

  token = this.tokenSignal.asReadonly();
  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => this.tokenSignal() !== null);
  isAdmin = computed(() => this.userSignal()?.isAdmin ?? false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<string> {
    // Convert credentials to URL-encoded form data
    const body = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<string>(`${this.API_URL}/login`, body.toString(), {
      headers,
      responseType: 'text' as 'json'
    }).pipe(
      tap((token) => {
        this.setToken(token);
        this.decodeAndStoreUser(token);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  signup(userData: RegisterUserDTO): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/signup`, userData);
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private setToken(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): UserInfo | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private decodeAndStoreUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const scope = payload.scope || '';
      const isAdmin = scope.includes('ROLE_ADMIN');
      
      const userInfo: UserInfo = {
        username: payload.name || '',
        email: payload.email || '',
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        isAdmin: isAdmin
      };
      this.userSignal.set(userInfo);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
}

