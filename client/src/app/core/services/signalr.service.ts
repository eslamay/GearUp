import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment.development';
import { AppNotification } from '../models/app-notification';



@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;

  notifications = signal<AppNotification[]>([]);

  startConnection() {
    if (this.hubConnection) return; // امنع فتح اتصال تاني لو فيه واحد شغال أصلاً

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}`, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hubConnection
      .start()
      .catch(err => console.error('SignalR connection error:', err));

    this.hubConnection.on('OrderCompleteNotification', (order: any) => {
      this.addNotification({
        id: crypto.randomUUID(),
        message: `Order #${order.id} has been confirmed!`,
        orderId: order.id
      });
    });
  }

  stopConnection() {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }

  private addNotification(notification: AppNotification) {
    this.notifications.update(list => [...list, notification]);

    // امسح الإشعار تلقائيًا بعد 5 ثواني
    setTimeout(() => {
      this.notifications.update(list => list.filter(n => n.id !== notification.id));
    }, 5000);
  }

  dismissNotification(id: string) {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}