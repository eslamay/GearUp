import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { firstValueFrom } from 'rxjs';
import { AccountService } from './features/account/account.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAppInitializer(() => {
      const accountService = inject(AccountService);
      return firstValueFrom(accountService.getUserInfo());
    })
  ],
};
