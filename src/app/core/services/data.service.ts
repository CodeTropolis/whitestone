// data.service for methods used across modules i.e. child.table from record module uses setCurrentChild() and createFinancialRecord()

import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class DataService {

  public currentChild$ = new BehaviorSubject<any>(null);
  public currentRecord: any;
  public currentFinancialDoc$: Observable<any>;

  constructor(private firebaseService: FirebaseService) {}

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentChild(child) {
    this.currentChild$.next(child); // Another UI may select other child
  }

  // Creates the base doc (as an observable) for all the student's financials
  public createFinancialDoc(id) {
    this.currentFinancialDoc$ = this.firebaseService.financialsCollection.doc(id).snapshotChanges()
      .pipe(
        tap((doc => {
          console.log(`pipe(tap.. : ${doc.payload.ref.id}`); // tap with log alerts us that there is a subscriber
          doc.payload.ref.get().then(snapshot => {
            if (!snapshot.exists) {
              doc.payload.ref.set({ dateCreated: new Date });
            }
          });
        }),
        ),
        shareReplay(1), // Give all subscribers a cached version of the doc which I'm thinking should be refreshed on snapshotChanges.
      );
  }

}