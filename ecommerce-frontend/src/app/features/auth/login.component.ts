import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, RouterLink],
	template: `
		<div class="auth-container">
			<h1>Login</h1>
			<form [formGroup]="form" (ngSubmit)="onSubmit()">
				<label>
					Username
					<input type="text" formControlName="username" />
				</label>
				<label>
					Password
					<input type="password" formControlName="password" />
				</label>
				<button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Logging in...' : 'Login' }}</button>
			</form>
			<a routerLink="/products">Continue as guest</a>
		</div>
	`,
	styles: [`
		.auth-container {
			max-width: 360px;
			margin: 40px auto;
			padding: 24px;
			background: white;
			border-radius: 8px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.1);
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		label { display: flex; flex-direction: column; gap: 6px; }
		input { padding: 8px 10px; }
		button { padding: 10px 12px; background: var(--primary); color: white; border: none; cursor: pointer; }
		button[disabled] { opacity: 0.6; cursor: not-allowed; }
	`]
})
export class LoginComponent {
	loading = signal(false);
	form = this.fb.group({
		username: ['', Validators.required],
		password: ['', Validators.required],
	});

	constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

	onSubmit() {
		if (this.form.invalid) return;
		this.loading.set(true);
		this.auth.login(this.form.getRawValue() as any).subscribe({
			next: () => {
				this.loading.set(false);
				this.router.navigate(['/']);
			},
			error: () => this.loading.set(false)
		});
	}
}