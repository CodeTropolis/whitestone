// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Dev DB:
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBuWI9F7DY-DlESWPn4jrR3JAiwy-cjO8s",
    authDomain: "stackblitz-e7240.firebaseapp.com",
    databaseURL: "https://stackblitz-e7240.firebaseio.com",
    projectId: "stackblitz-e7240",
    storageBucket: "stackblitz-e7240.appspot.com",
    messagingSenderId: "548688526365"
  }
};


/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
