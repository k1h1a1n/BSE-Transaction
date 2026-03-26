import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpsInterceptor } from './https.interceptor';

// import {LocalCacheTTLInterceptor} from './local-cache-ttl.interceptor'

export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: HttpsInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: LocalCacheTTLInterceptor, multi: true }
  ];
