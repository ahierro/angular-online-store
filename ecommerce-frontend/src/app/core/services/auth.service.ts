import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

interface LoginRequest { username: string; password: string }
interface JwtPayload { sub: string; roles?: string[]; exp?: number }

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly tokenKey = 'auth_token';
	readonly isAuthenticated = signal<boolean>(this.hasValidToken());
	readonly roles = signal<string[]>(this.getRolesFromToken());
	readonly username = signal<string | null>(this.getUsernameFromToken());

	constructor(private http: HttpClient) {}

	login(credentials: LoginRequest) {
		return this.http.post<{ token?: string } | string>(`/api/login`, credentials)
			.pipe(tap((res: any) => {
				const token = typeof res === 'string' ? res : res?.token;
				if (!token) throw new Error('No token in response');
				this.setToken(token);
			}));
	}

	logout(): void {
		localStorage.removeItem(this.tokenKey);
		this.isAuthenticated.set(false);
		this.roles.set([]);
		this.username.set(null);
	}

	getToken(): string | null {
		return localStorage.getItem(this.tokenKey);
	}

	isAdmin(): boolean {
		return this.roles().includes('ADMIN');
	}

	private setToken(token: string) {
		localStorage.setItem(this.tokenKey, token);
		this.isAuthenticated.set(this.hasValidToken());
		this.roles.set(this.getRolesFromToken());
		this.username.set(this.getUsernameFromToken());
	}

	private hasValidToken(): boolean {
		const token = this.getToken();
		if (!token) return false;
		try {
			const payload = this.decode(token);
			return !payload.exp || payload.exp * 1000 > Date.now();
		} catch {
			return false;
		}
	}

	private getRolesFromToken(): string[] {
		const token = this.getToken();
		if (!token) return [];
		try {
			const payload = this.decode(token);
			const rawRoles = (payload as any)['roles'] || (payload as any)['authorities'] || [];
			if (Array.isArray(rawRoles)) return rawRoles;
			if (typeof rawRoles === 'string') return rawRoles.split(',');
			return [];
		} catch {
			return [];
		}
	}

	private getUsernameFromToken(): string | null {
		const token = this.getToken();
		if (!token) return null;
		try {
			const payload = this.decode(token);
			return (payload as any)['sub'] ?? null;
		} catch {
			return null;
		}
	}

	private decode(token: string): JwtPayload {
		const parts = token.split('.');
		if (parts.length !== 3) throw new Error('Invalid token');
		const payload = JSON.parse(atob(parts[1]));
		return payload as JwtPayload;
	}
}