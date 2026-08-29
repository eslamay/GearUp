import { Component } from '@angular/core';
import { HeaderComponent } from "./layout/header/header.component";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./layout/footer/footer.component";
import { ToastContainerComponent } from "./shared/components/toast-container/toast-container.component";

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, FooterComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'GearUp';
}
