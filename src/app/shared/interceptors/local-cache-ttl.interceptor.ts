import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHeaders, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, share } from 'rxjs/operators';

interface HttpResponseCacheTTL {
  httpResponse : HttpResponse<any>;
  httpResponseTTL : any;
}

@Injectable()
export class LocalCacheTTLInterceptor implements HttpInterceptor {

  private localCacheTTLMap: Map<string, HttpResponseCacheTTL> = new Map();

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if( ! request?.headers?.getAll('LOCAL_CAHCE_TTL') ){
      return next.handle(request);
    }
    let localCacheTTLKey: any;
let localCacheTTL: any;

     [localCacheTTLKey, localCacheTTL] = request.headers.getAll('LOCAL_CAHCE_TTL') || [undefined,undefined];
    let ttl = this.formatTTL(localCacheTTL);
    console.log(' LocalCacheTTLInterceptor localCacheTTLKey, localCacheTTL : {', localCacheTTLKey, localCacheTTL, ttl,'}');

    const cachedResponse: HttpResponse<any> = this.getResponeWithTTL(localCacheTTLKey) as HttpResponse<any>;
    if(cachedResponse) {
        return of(cachedResponse.clone())
    }else {
        return next.handle(request).pipe(
            tap(stateEvent => {
                if(stateEvent instanceof HttpResponse) {
                    this.setResponeWithTTL(localCacheTTLKey, ttl, stateEvent.clone())
                }
            }),
            share()
        );
    }
  }

  formatTTL(localCacheTTL: { split: (arg0: string) => [any, any]; }){

    let ttl = 0;
    const ttlDate = new Date();
    let [format,value] = localCacheTTL.split(':');

    try{
      value = parseInt(value);
    }
    catch(e){
      value = 1;
    }

    //Expiry time (or Time to live) set provided [hours or minutes or seconds] plus current time
    switch( format ){
      case 'HH':
        ttlDate.setHours( ttlDate.getHours() + value );
        ttl = ttlDate.getTime();
        break;
      case 'MM':
        ttlDate.setHours( ttlDate.getMinutes() + value );
        ttl = ttlDate.getTime();
        break;
      case 'SS':
        ttlDate.setHours( ttlDate.getSeconds() + value );
        ttl = ttlDate.getTime();
        break;
      default:
        ttl = -1; // No Expiry
    }

    return ttl;
  }

  //Set response to Map and Localstorage for provided key
  setResponeWithTTL(key: string, ttl: number, response: HttpResponse<any>) {

    // `cacheResponseTTL` is an object which contains the original response
    // as well as the time when it's supposed to expire
    const cacheResponseTTL : HttpResponseCacheTTL = {
      httpResponse : response,
      httpResponseTTL : ttl
    };

    console.log( response.body?.Status );
    if( response.body && response.body.Status != 'F' ){
      localStorage.setItem(key, JSON.stringify(cacheResponseTTL)); // To make available response on app restart / reload
      this.localCacheTTLMap.set(key, cacheResponseTTL); // For Faster Access next time
    }

  }

  //Get response from Map or Localstorage for provided key
  getResponeWithTTL(key: string) {

    const cacheItem = this.localCacheTTLMap.get(key) || this.deserialize(key);
    // if the response doesn't exist, return null
    if (!cacheItem) {
      return null
    }

    // If TTL is set as -1 (Expiry Check not required)
    if( cacheItem.httpResponseTTL == -1 ) {
      return cacheItem.httpResponse;
    }

    const now = new Date()
    console.log(now.getTime(), cacheItem.httpResponseTTL);
    // compare the time to live (TTL) of the response with the current time
    if (now.getTime() > cacheItem.httpResponseTTL)
    {
      // If the response is expired, delete the response from storage and return null
      this.localCacheTTLMap.delete(key);
      localStorage.removeItem(key);
      return null
    }
    return cacheItem.httpResponse;

  }

  // To build HttpResponseCacheTTL using cached data
  deserialize(key: string):  HttpResponseCacheTTL | null {

    // Checks if Response is available in LocalStorage or not
    const res = localStorage.getItem(key);
    if( !res ){
      return null;
    }
    // Prepares HttpResponseCacheTTL and set in Map for faster access
    const cacheItem = JSON.parse(res);
    const cacheResponseTTL : HttpResponseCacheTTL =  {
      httpResponse : this.deserializeResponse(cacheItem.httpResponse),
      httpResponseTTL : cacheItem.httpResponseTTL
    }
    this.localCacheTTLMap.set(key, cacheResponseTTL);
    return cacheResponseTTL;

  }

  // To build HttpResponse using cached Response object
  deserializeResponse(response: any): HttpResponse<any> {

    const headers = new HttpHeaders(response.headers);
    return new HttpResponse<any>({
        headers,
        body: response.body,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
    });

  }

}
