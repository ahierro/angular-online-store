import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSignal = signal<Alert[]>([]);
  alerts = this.alertsSignal.asReadonly();

  show(type: AlertType, message: string, duration: number = 5000): void {
    const alert: Alert = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    this.alertsSignal.update((alerts) => [...alerts, alert]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(alert.id);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  remove(id: string): void {
    this.alertsSignal.update((alerts) => alerts.filter((alert) => alert.id !== id));
  }

  clear(): void {
    this.alertsSignal.set([]);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

