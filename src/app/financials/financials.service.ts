import { Injectable } from '@angular/core';
import { DataService } from '../core/services/data.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FinancialsService {

  public categories: any;
  public currentFinancialDoc: any;

  public runningBalanceForCurrentCategory$ = new BehaviorSubject<number>(null);
  public currentCategory$ = new BehaviorSubject<string>(null);
  public transactions$ = new BehaviorSubject<any>(null);


  public showAvatarSpinner$ = new BehaviorSubject<boolean>(false); // set to false so that avatar spinner on category-select.component does not show initially

  constructor(private dataService: DataService) {

    this.categories = { 
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;
  }

  public getTransactions(collection) {
    console.log('TCL: FinancialsService -> publicgetTransactions -> collection', collection);
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
