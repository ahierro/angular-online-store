import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  private alertService = inject(AlertService);
  alerts = this.alertService.alerts;

  removeAlert(id: string): void {
    this.alertService.remove(id);
  }

  getAlertClass(type: string): string {
    const baseClass = 'alert alert-dismissible fade show';
    switch (type) {
      case 'success':
        return `${baseClass} alert-success`;
      case 'error':
        return `${baseClass} alert-danger`;
      case 'warning':
        return `${baseClass} alert-warning`;
      case 'info':
        return `${baseClass} alert-info`;
      default:
        return `${baseClass} alert-primary`;
    }
  }
}

