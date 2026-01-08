import { Component, signal, ChangeDetectionStrategy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('loginFormElement', { static: false }) loginFormElement!: ElementRef<HTMLFormElement>;

  private errorMessage = signal<string | null>(null);
  private isLoading = signal(false);

  error = this.errorMessage.asReadonly();
  loading = this.isLoading.asReadonly();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(1)]],
    password: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngAfterViewInit(): void {
    // Set up form to submit to hidden iframe for browser password detection
    if (this.loginFormElement?.nativeElement) {
      const form = this.loginFormElement.nativeElement;
      
      // Create hidden iframe for form submission
      let iframe = document.getElementById('login-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'login-iframe';
        iframe.name = 'login-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }
      
      form.target = 'login-iframe';
      
      // Listen for iframe load to handle response
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const responseText = iframeDoc.body?.textContent || iframeDoc.body?.innerText || '';
            this.handleFormResponse(responseText);
          }
        } catch (e) {
          // Cross-origin or other error - handle via Angular service instead
          console.debug('Could not read iframe response, using Angular service');
        }
      };
    }
  }

  onSubmit(event: Event): void {
    if (this.loginForm.invalid) {
      event.preventDefault();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!
    };

    // Let the form submit naturally to the iframe (for browser password detection)
    // Also perform login via Angular service in parallel for app logic
    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        const isAdmin = this.authService.isAdmin();
        this.router.navigate([isAdmin ? '/admin/products' : '/products']);
      },
      error: (error) => {
        this.isLoading.set(false);
        // Even if Angular service fails, the form already submitted to iframe
        // The browser will see the error response and won't save password (which is correct)
        this.errorMessage.set(
          error.error?.message || 'Invalid username or password'
        );
      }
    });

    // Don't prevent default - let form submit naturally to trigger browser password save
    // The form submits to hidden iframe, so it won't navigate away
  }

  private handleFormResponse(responseText: string): void {
    // Handle response from form submission if needed
    // The Angular service already handles the main login logic
    try {
      // If backend returns token in form response, we could parse it here
      // But since we're using Angular service, this is mainly for browser detection
      if (responseText && responseText.trim().length > 0) {
        // Response received - browser should detect successful form submission
        console.debug('Form submission response received');
      }
    } catch (e) {
      console.debug('Error handling form response:', e);
    }
  }
}

