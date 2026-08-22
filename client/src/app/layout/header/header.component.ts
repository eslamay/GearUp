import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../features/account/account.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
accountService = inject(AccountService);
  private router = inject(Router);

  logout() {
    this.accountService.logout().subscribe({
      next: () => this.router.navigateByUrl('/account/login')
    });
  }
}
