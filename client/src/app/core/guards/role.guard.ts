import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../features/account/account.service';
import { inject } from '@angular/core';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const accountService = inject(AccountService);
    const router = inject(Router);

    const user = accountService.currentUser();

    if (user && allowedRoles.includes(user.roles)) {
      return true;
    }

    router.navigateByUrl('/shop');
    return false;
  };
};
