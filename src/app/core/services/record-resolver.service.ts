import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecordResolverService implements Resolve<any> {

  constructor(private fs: FirebaseService) { }

  // The observable provided to the Router must complete *. 
  // If the observable does not complete, the navigation will not continue.

  resolve(){ 

    return this.fs.records$.pipe(
      take(1), // * take and complete.  Removing this will cause silent failure
      map( payload => payload)
    )
  }

}
