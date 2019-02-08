import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import {take } from 'rxjs/operators';
import { FirebaseService } from '../core/services/firebase.service';
import { AuthService } from '../core/services/auth.service';
import { DataService } from '../core/services/data.service';

//import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FinancialsService {

  public categories: any;
  public currentStudent$ = new BehaviorSubject<any>(null);
  public currentFinancialDoc$ = new BehaviorSubject<any>(null); // Each student has own financial doc
  public currentCategory$ = new BehaviorSubject<any>(null); 
  public runningBalanceForCurrentCategory$ = new BehaviorSubject<number>(null);
  public showHistory$ = new BehaviorSubject<boolean>(null);
  public transactions: any[] = [];
  public transactions$ = new BehaviorSubject<any[]>(null);

  public financialDocs$: Observable<any[]>;

  constructor(private firebaseService: FirebaseService, 
              private authService: AuthService, 
              private dataService: DataService,
              private afs: AngularFirestore) {

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
  // Outside of if (!snapshot.exists) because, in addition to future financial docs, this also needs to be done for existing financial docs.

  public setupFinancialDoc(student) {
    // Only admin user can write per Firestore rule and financial doc should only be created if user admin role is true.
    // if (this.authService.user['roles'].admin) {   
    //   this.firebaseService.financialsCollection.doc(student.id)
    //     .set({
    //       recordId: this.dataService.currentRecord.realId,
    //       fatherEmail: this.dataService.currentRecord.fatherEmail,
    //       motherEmail: this.dataService.currentRecord.motherEmail,
    //       childFirstName: student.fname,
    //       childLastName: student.lname,
    //     },
    //       { merge: true }
    //     )
    //     .then(_ => { // Set the current financial doc
    //       this.firebaseService.financialsCollection.doc(student.id).ref.get()
    //         .then(doc => {
    //           this.currentFinancialDoc$.next(doc);
    //         })
    //     })
    // } else { // Else a non-admin user so retrieve only.
  
    //   // ...ref.get() yields permission errors if the student is selected by a parent prior to admin creating a doc in the financials collection.
    //   // This is because of trying to read a document that doesn't exist thus the following rules for financials collection will not pass:
      
    //   // match /financials/{financial=**} {
    //   //   allow read: if isAuth() && getRole('subscriber') == true
    //   //   && getUserEmail() == resource.data.fatherEmail  <========= here
    //   //   || getUserEmail() == resource.data.motherEmail; <========= and here
        
    //   //   allow read, write: if isAuth() && getRole('admin') == true;
    //   // }

    //   // joaquin cid [3:15 PM]
    //   // right, but from the functions scope, you’ll bypass all rules (edited) 
    //   // if you write a firebase function, you’ll use firebase-admin library that connects to the firestore database and has full-access (edited) 

    //   this.firebaseService.financialsCollection.doc(student.id).ref.get() 
    //     .then(doc => {
    //       if(doc.data()){
    //           this.currentFinancialDoc$.next(doc); 
    //       }else{ 
    //        console.log('No financial data for this student!'); 
    //       } 
    //     })
    // }
  }

  public getTransactions(currentFinancialDoc, collection){
      // Get transactions (amounts from <cat.key>payments | charges collections)
      const type = collection.includes('Payment') ? 'Payment' : 'Charge';
      currentFinancialDoc.ref.collection(collection).get()
      .then(snapshot => {
          snapshot.forEach(item => {
            let date = item.data().date.toDate();
            const transactionObj = {
              id: item.id, 
              amount: item.data().amount, 
              type: type, 
              date: date,
              memo: item.data().memo 
            }
            this.transactions.push(transactionObj);
            this.transactions$.next(this.transactions);

          });
      });
  }

}
