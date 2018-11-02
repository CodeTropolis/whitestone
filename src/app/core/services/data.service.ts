import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  public currentChild$ = new BehaviorSubject<any>(null);
  public childrenOfRecord: any[] =[];
  public currentRecord: any;
  public currentFinancialDoc$ = new BehaviorSubject<any>(null);
  public financialDocExists: boolean;



  constructor(private firebaseService: FirebaseService, private authService: AuthService, private router:Router) {}

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public setCurrentRecord(record){
    this.currentRecord = record;
    this.childrenOfRecord = this.convertMapToArray(record.children);
  }

  // Pass the father/mother email addresses to the financial document in order to secure reads to match user email.  
  // Outside of if (!snapshot.exists) because this needs to be done for future as well as existing financial docs.

  public createFinancialDoc(child, link?){
    this.currentChild$.next(child); // ToDo: For category-select.component - get child's name from financials document.
    // Only admin user can write per Firestore rule and financial doc should only be created if user admin role is true.
      if (this.authService.user['roles'].admin){
        this.firebaseService.financialsCollection.doc(child.id)
          .set({recordId: this.currentRecord.realId,
              fatherEmail: this.currentRecord.fatherEmail, 
              motherEmail: this.currentRecord.motherEmail,
              childFirstName: child.fname, 
              childLastName: child.lname,
              }, 
              {merge: true}
            )
            .then( _ => { // Set the currentFinancialDoc$
              console.log(`doc written.`);
              this.firebaseService.financialsCollection.doc(child.id).ref.get()
                .then(doc => {
                  this.currentFinancialDoc$.next(doc);
                  if(link){
                    this.router.navigate([link]); // Need to wait until financial doc is created and observble set because entry.component subscribes to currentFinancialDoc$
                  }
                })
             
              // .pipe(
              //   tap( doc => {
              //     console.log(`pipe(tap( doc: ${doc.payload.ref.id}`); // tap with log alerts us that there is a subscriber
              //    }
              //   )
              // )
            })
        }
  }

  // Creates the base doc (as an observable) for all the selected student's financials
  // public setFinancialDoc(child) {
  //   this.currentChild$.next(child); // ToDo: For category-select.component - get child's name from financials document.
  //   this.currentFinancialDoc$ = this.firebaseService.financialsCollection.doc(child.id).snapshotChanges()
  //     .pipe(
  //       tap((doc => {
  //        // console.log(`pipe(tap.. : ${doc.payload.ref.id}`); // tap with log alerts us that there is a subscriber
  //         doc.payload.ref.get().then(snapshot => {

  //           // Pass the email to the financial document in order to secure reads to match user email.  
  //           // Outside of if (!snapshot.exists) because this needs to be done for future as well as existing financial docs. 
  //           // NOTE because of being outside of if (!snapshot.exists) and snapshotChanges() , this causes infinite loop in subscription to currentFinancialDoc$
    
  //           // Only admin user can write per Firestore rule and financial doc should only be created if user admin role is true.
  //           if (this.authService.user['roles'].admin){
  //             // doc.payload.ref.set({recordId: this.currentRecord.realId}); 
  //             // doc.payload.ref.set({childFname: child.fname, childLname: child.lname}); 
  //             // if(this.currentRecord.fatherEmail){
  //             //   doc.payload.ref.set({ fatherEmail: this.currentRecord.fatherEmail});
  //             //   //console.log('write') // Since this is within snapshotChanges() this will write on every doc change.
  //             // }
  //             // if(this.currentRecord.motherEmail){
  //             //   doc.payload.ref.set({ motherEmail: this.currentRecord.motherEmail});  
  //             // }
  //             if (!snapshot.exists) {
  //               doc.payload.ref.set({ dateCreated: new Date });
  //             }
  //           }
  //         });
  //       }),
  //       ),
  //       shareReplay(1), // Give all subscribers a cached version of the doc which I'm thinking should be refreshed on snapshotChanges.
  //     );
  // }

}