import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FinancialsService {

  public categories: any;
  public currentFinancialDoc: any;
  public currentRecord: any;

  public showAvatarSpinner$ = new BehaviorSubject<boolean>(false); // set to false so that avatar spinner on financials.component does not show initially

  public currentFinancialDoc$ = new BehaviorSubject<any>(null);
  public currentChild$ = new BehaviorSubject<any>(null);
  public currentCategory$ = new BehaviorSubject<string>(null);
  public runningBalanceForCurrentCategory$ = new BehaviorSubject<number>(null);
  public transactions$ = new BehaviorSubject<any>(null);

  constructor(private firebaseService: FirebaseService) {
    
    this.categories = {
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }

    this.currentFinancialDoc$.subscribe(payload => {
      this.currentFinancialDoc = payload;
    })
  }

  public createFinancialRecord(id) {
    this.currentFinancialDoc$.next(this.firebaseService.financialsCollection.doc(id));
    this.currentFinancialDoc.ref.get().then((snapshot) => {
      if (!snapshot.exists) {
        this.currentFinancialDoc.set({ dateCreated: new Date });
      }
    });
  }

  public setCurrentChild(child){
    this.currentChild$.next(child);
  }

  public getTransactions(collection) {
    const transactions: any[] = [];
    this.currentFinancialDoc.collection(collection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            const type = collection.includes('Payment') ? 'Payment' : 'Charge'
            transactions.push({ id: item.id, amount: item.data().amount, type: type, date: date, memo: item.data().memo });
            this.transactions$.next(transactions);
          }
        )

      });

  }

}