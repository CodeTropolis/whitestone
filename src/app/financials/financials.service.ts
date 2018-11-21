import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from '../core/services/firebase.service';
import { AuthService } from '../core/services/auth.service';
import { DataService } from '../core/services/data.service';

@Injectable()
export class FinancialsService {

  public categories: any;
  public currentStudent$ = new BehaviorSubject<any>(null);
  public currentFinancialDoc$ = new BehaviorSubject<any>(null); // Each student has own financial doc
  public currentCategory$ = new BehaviorSubject<any>(null); 
  public runningBalanceForCurrentCategory$ = new BehaviorSubject<number>(null);

  constructor(private firebaseService: FirebaseService, 
              private authService: AuthService, 
              private dataService: DataService) {

    this.categories = {
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }

  }

  public setCurrentStudent(student){
    this.currentStudent$.next(student); 
  }

  // Pass the father/mother email addresses to the financial document in order to secure reads to match user email.  
  // Outside of if (!snapshot.exists) because this needs to be done for future as well as existing financial docs.

  public setupFinancialDoc(student) {
    // Only admin user can write per Firestore rule and financial doc should only be created if user admin role is true.
    if (this.authService.user['roles'].admin) {
      this.firebaseService.financialsCollection.doc(student.id)
        .set({
          recordId: this.dataService.currentRecord.realId,
          fatherEmail: this.dataService.currentRecord.fatherEmail,
          motherEmail: this.dataService.currentRecord.motherEmail,
          childFirstName: student.fname,
          childLastName: student.lname,
        },
          { merge: true }
        )
        .then(_ => { // Set the current financial doc
          this.firebaseService.financialsCollection.doc(student.id).ref.get()
            .then(doc => {
              this.currentFinancialDoc$.next(doc);
            })
        })
    } else { // Else a non-admin user so retrieve only
      this.firebaseService.financialsCollection.doc(student.id).ref.get()
        .then(doc => {
          this.currentFinancialDoc$.next(doc); 
        })
    }
  }

}
