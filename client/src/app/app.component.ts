import { Component } from '@angular/core';
import { HeaderComponent } from "./layout/header/header.component";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./layout/footer/footer.component";

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'GearUp';
}
