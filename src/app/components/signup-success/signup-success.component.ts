import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup-success',
  imports: [CommonModule, RouterLink],
  templateUrl: './signup-success.component.html',
  styleUrl: './signup-success.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupSuccessComponent {
  private defaultMessage = 'Account created successfully! Please check your email to confirm your account before logging in.';
  
  message = signal(this.getMessageFromState());

  private getMessageFromState(): string {
    // Get message from browser history state (Angular router populates this)
    if (typeof history !== 'undefined' && history.state && history.state['message']) {
      return history.state['message'];
    }
    return this.defaultMessage;
  }
}
