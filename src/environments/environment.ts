// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Dev DB:
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCFCWcqL1Qfcz0SHXm5SdeuXR9ia4eAm5M",
    authDomain: "ws-local-angular.firebaseapp.com",
    databaseURL: "https://ws-local-angular.firebaseio.com",
    projectId: "ws-local-angular",
    storageBucket: "ws-local-angular.appspot.com",
    messagingSenderId: "617661305077",
    appId: "1:617661305077:web:a3617df00a61ba27"
  }
};


/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
