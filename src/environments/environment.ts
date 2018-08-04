// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
    
    clientId: 'rcTVNP9Lwo04AnvEUL8XWpC5McEFALo5',
     baseURL: 'https://thiamat.nyxk.com.br:4040/api/1.0',
    baseHost: 'thiamat.nyxk.com.br:4040',
 redirectUri:  window.location.origin+'/callback',

};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
