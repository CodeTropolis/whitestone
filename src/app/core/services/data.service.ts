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
  public childrenOfRecord: any[] =[];
  public currentRecord: any;
  public currentFinancialDoc$: Observable<any>;
  public financialDocExists: boolean;



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

  public setCurrentRecord(record){
    this.currentRecord = record;
    this.childrenOfRecord = this.convertMapToArray(record.children);
  }

  // Creates the base doc (as an observable) for all the selected student's financials
  public setFinancialDoc(child) {
    this.currentChild$.next(child);
    this.currentFinancialDoc$ = this.firebaseService.financialsCollection.doc(child.id).snapshotChanges()
      .pipe(
        tap((doc => {
         // console.log(`pipe(tap.. : ${doc.payload.ref.id}`); // tap with log alerts us that there is a subscriber
          doc.payload.ref.get().then(snapshot => {

            // Pass the email to the financial document in order to secure reads to match user email.  
            // Outside of if (!snapshot.exists) because this needs to be done for future as well as existing financial docs. 

            // Only admin user can write per Firestore rule and financial doc should only be created if user admin role is true.
          
            if (this.authService.user['roles'].admin){
              doc.payload.ref.set({recordId: this.currentRecord.realId}, {merge:true}); 
              doc.payload.ref.set({childFname: child.fname, childLname: child.lname}, {merge:true}); 
              if(this.currentRecord.fatherEmail){
                doc.payload.ref.set({ fatherEmail: this.currentRecord.fatherEmail}, {merge:true});
                //console.log('write') // Since this is within snapshotChanges() this will write on every doc change.
              }
              if(this.currentRecord.motherEmail){
                doc.payload.ref.set({ motherEmail: this.currentRecord.motherEmail}, {merge:true});  
              }
              if (!snapshot.exists) {
                doc.payload.ref.set({ dateCreated: new Date });
                //this.financialDocExists = true;
              }
            }
          });
        }),
        ),
        shareReplay(1), // Give all subscribers a cached version of the doc which I'm thinking should be refreshed on snapshotChanges.
      );
  }

}