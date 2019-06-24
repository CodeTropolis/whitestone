import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from '../core/services/firebase.service';
import { AuthService } from '../core/services/auth.service';

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

  constructor(private firebaseService: FirebaseService, private authService: AuthService) {

    this.categories = {
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }

  }

  public setFinancialDoc(student) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentFinancialDoc$.next(null);
        this.firebaseService.financialsCollection.doc(student.id).ref.get()
          .then(doc => {
            if (doc.exists) {
                this.currentFinancialDoc$.next(doc);
            } else {
              alert(`The financial document for this ${student.fname + ' ' + student.lname} does not exist. \n` +
              `To create a starting financial doc, go to the applicable record in 'Record List', click` +
              `'Update Family Record' and click the 'Update' button.`);
            }
          });
      }
    });
  }


  public getTransactions(currentFinancialDoc, collection) {
      // Get transactions (amounts from <cat.key>payments | charges collections)
      const type = collection.includes('Payment') ? 'Payment' : 'Charge';
      currentFinancialDoc.ref.collection(collection).get()
      .then(snapshot => {
          snapshot.forEach(item => {

            // Need to do this when date is formatted in DB as Month DD, YYYY at 12:00:00:00 AM UTC-6
           const date = item.data().date.toDate();

            const transactionObj = {
              id: item.id,
              amount: item.data().amount,
              type: type,
              date: date,
              // date: item.date,
              taxDeductible: item.data().taxDeductible,
              memo: item.data().memo
            };
            this.transactions.push(transactionObj);
            this.transactions$.next(this.transactions);
          });
      });
  }
}
