import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public currentFinancialDoc: any;
  public currentRecord: any;
  public currentChild: any;

  public transactions: any[] = [];

  public category$ = new BehaviorSubject<any>(null);
  public paymentsCollection$ = new BehaviorSubject<any>(null);
  public deductionsCollection$ = new BehaviorSubject<any>(null);
  public transactions$ = new BehaviorSubject<any>(null);

  constructor(private fs: FirebaseService) { }

  public createFinancialRecord(child) {
    this.currentFinancialDoc = this.fs.financialsCollection.doc(child.id);
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

  public getTransactions(category, paymentsCollection, deductionsCollection){
    this.transactions = [];
    this.currentFinancialDoc.collection(paymentsCollection).ref.get()
    .then(snapshot => {
      snapshot.forEach(
        item => {
          let date = item.data().date.toDate();
          const type = category.key === 'tuition' ? "Payment" : "Credit"
          this.transactions.push({ amount: item.data().payment, type: type, date: date, memo: item.data().memo });
          this.transactions$.next(this.transactions);
          //console.log(`this.transactions: ${this.transactions}`);
        }
      )

      this.currentFinancialDoc.collection(deductionsCollection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            this.transactions.push({ amount: item.data().deduction, type: "Deduction", date: date, memo: item.data().memo });
            this.transactions$.next(this.transactions);
            //console.log(`In history.component - this.transactions: ${this.transactions}`);
          }
        )
      });

    });

  }

}
