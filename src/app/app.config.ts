import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
<<<<<<< Updated upstream

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
=======
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
>>>>>>> Stashed changes

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
<<<<<<< Updated upstream
    provideHttpClient()
  ]
=======
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
>>>>>>> Stashed changes
};
