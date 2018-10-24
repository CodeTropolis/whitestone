// data.service for methods used across modules i.e. child.table from record module uses setCurrentChild() and createFinancialRecord()

import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';


@Injectable({
  providedIn: 'root'
})

export class DataService {

  public currentChild$ = new BehaviorSubject<any>(null);
  public currentRecord: any;
  public currentFinancialDoc$: Observable<any>;

  constructor(private firebaseService: FirebaseService, private authService: AuthService) {
    // Only subscribing to make observable hot so that I can see the 
    // reads per mapAndReplayCollection in firebase.service.ts
    // Could be causing even more reads because of anytime something changes with the
    // financials collection, snapshotChanges in the mapAndReplayCollection will log,
    // which may cause a read on the collection.
    
    // this.firebaseService.financials$.subscribe(doc => { 
    //   //console.log(`financials$ payload: ${JSON.stringify(doc)}`);
    // })
  }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentChild(child) {
    this.currentChild$.next(child); // Another UI may select other child
  }

  // Creates the base doc (as an observable) for all the selected student's financials
  public setFinancialDoc(id, record) {
    this.currentFinancialDoc$ = this.firebaseService.financialsCollection.doc(id).snapshotChanges()
      .pipe(
        tap((doc => {
          //console.log(`pipe(tap.. : ${doc.payload.ref.id}`); // tap with log alerts us that there is a subscriber
          doc.payload.ref.get().then(snapshot => {
            // Pass the email to the financial document in order to secure reads to match user email.   
            // Only admin user can write per Firestore rule. 
            // Need to do for existing and future financial docs. 
            if (this.authService.user['roles'].admin){ 
              console.log('TCL: publicsetFinancialDoc -> snapshot user is admin');
              if(record.fatherEmail){
                doc.payload.ref.set({ fatherEmail: record.fatherEmail}, {merge:true});
                console.log('write') // Since this is within snapshotChanges() this will write on every doc change.
              }
              if(record.motherEmail){
                doc.payload.ref.set({ motherEmail: record.motherEmail}, {merge:true});  
              }
            }
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