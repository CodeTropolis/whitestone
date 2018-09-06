import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public currentFinancialDoc: any;
  public currentRecord: any;
  public currentChild: any;

  public transactions: any[] = [];

  public currentFinancialDoc$ = new BehaviorSubject<any>(null);
  public transactions$ = new BehaviorSubject<any>(null);
  public collectionExits$ = new BehaviorSubject<boolean>(false);

  constructor(private fs: FirebaseService) {

    this.currentFinancialDoc$.subscribe(payload => {
      this.currentFinancialDoc = payload;
    })
    
   }

  public createFinancialRecord(child) {
    
    this.currentFinancialDoc$.next(this.fs.financialsCollection.doc(child.id));

    this.currentFinancialDoc.ref.get().then((snapshot) => {
      if (!snapshot.exists) {
        this.currentFinancialDoc.set({ dateCreated: new Date });
      }
    });

    this.currentChild = child;
  }

  public convertMapToArray(map: {}) {
    const keys = Object.keys(map)
    return keys.map(key => map[`${key}`])
  }

  public getTransactions(collection) {
    this.transactions = [];
    this.currentFinancialDoc.collection(collection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {     
            let date = item.data().date.toDate();
            const type = collection.includes('Payment') ? 'Payment' : 'Charge'
            this.transactions.push({ id:item.id, amount: item.data().amount, type: type, date: date, memo: item.data().memo });
            this.transactions$.next(this.transactions);
          }
        )

      });

  }

}
