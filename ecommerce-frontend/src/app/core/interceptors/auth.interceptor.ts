import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);
	const router = inject(Router);
	const token = authService.getToken();
	const isApi = req.url.startsWith('/api');
	const authReq = token && isApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
	return next(authReq);
};