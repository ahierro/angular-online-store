import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { handleFormValidationErrors } from '../../utils/form-error.util';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  private errorMessage = signal<string | null>(null);
  private successMessage = signal<string | null>(null);
  private isLoading = signal(false);

  error = this.errorMessage.asReadonly();
  success = this.successMessage.asReadonly();
  loading = this.isLoading.asReadonly();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  getServerError(controlName: string): string | null {
    const control = this.signupForm.get(controlName);
    if (control && control.hasError('serverError')) {
      return control.getError('serverError');
    }
    return null;
  }

  hasServerError(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return control ? control.hasError('serverError') : false;
  }

  signupForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(1)]],
    password: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    isAdmin: [false]
  });

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const userData = {
      username: this.signupForm.value.username!,
      password: this.signupForm.value.password!,
      email: this.signupForm.value.email!,
      firstName: this.signupForm.value.firstName!,
      lastName: this.signupForm.value.lastName!,
      isAdmin: this.signupForm.value.isAdmin ?? false
    };

    this.authService.signup(userData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          'Account created successfully! Please check your email to confirm your account before logging in.'
        );
      },
      error: (error) => {
        this.isLoading.set(false);
        // Try to handle validation errors first
        if (handleFormValidationErrors(error, this.signupForm)) {
          // Validation errors were handled and displayed on fields, clear any generic error message
          this.errorMessage.set(null);
        } else {
          // If no validation errors were handled, show generic error
          this.errorMessage.set(
            error.error?.message || 'Failed to create account. Please try again.'
          );
        }
      }
    });
  }
}

