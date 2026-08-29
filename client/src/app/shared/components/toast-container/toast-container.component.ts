import { Component, inject } from '@angular/core';
import { SignalRService } from '../../../core/services/signalr.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  signalRService = inject(SignalRService);

  dismiss(id: string) {
    this.signalRService.dismissNotification(id);
  }
}