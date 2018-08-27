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

  public transactions$ = new BehaviorSubject<any>(null);
  public collectionExits$ = new BehaviorSubject<boolean>(false);

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

  // public checkForCollection(currentDoc: any, collection: string) {
  //   currentDoc.collection(collection).ref.get().
  //     then(sub => {
  //       if (sub.docs.length > 0) {
  //        console.log(`${collection} exists`);
  //         this.collectionExits$.next(true);
  //       } else {
  //        console.log(`${collection} does not exist`);
  //         this.collectionExits$.next(false);
  //       }
  //     });
  // }

  public getTransactions(collection) {
    this.transactions = [];
    this.currentFinancialDoc.collection(collection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            const type = collection.includes('Payment') ? 'Payment' : 'Charge'
            this.transactions.push({ amount: item.data().amount, type: type, date: date, memo: item.data().memo });
            this.transactions$.next(this.transactions);
          }
        )

      });

      // this.currentFinancialDoc.collection(chargesCollection).ref.get()
      // .then(snapshot => {
      //   snapshot.forEach(
      //     item => {
      //       let date = item.data().date.toDate();
      //       this.transactions.push({ amount: item.data().amount, type: "Charge", date: date, memo: item.data().memo });
      //       this.transactions$.next(this.transactions);
      //     }
      //   )
      // });

  }

}
