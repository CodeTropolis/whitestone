import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';
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

  public createFinancialDoc(child){
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
              //console.log(`doc written.`);
              this.firebaseService.financialsCollection.doc(child.id).ref.get()
                .then(doc => {
                  this.currentFinancialDoc$.next(doc);
                })
            })
        }
  }
}