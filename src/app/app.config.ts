import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpsInterceptor } from './shared/interceptors/https.interceptor';
import { SHARED_PROVIDERS } from './shared';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
 provideHttpClient(
    withInterceptorsFromDi()),
//  {
//     provide: HTTP_INTERCEPTORS,
//     useClass: LocalCacheTTLInterceptor,
//     multi: true
//   },
   {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpsInterceptor,
    multi: true
  },
  ...SHARED_PROVIDERS
  ]
};
