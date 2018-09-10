import { Injectable } from '@angular/core';
import { DataService } from '../core/services/data.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FinancialsService {
  public categories: any;
  private currentFinancialDoc: any;
  public currentCategory$ = new BehaviorSubject<string>(null);
  public startingBalanceKey$ = new BehaviorSubject<string>(null);
  public startingBalanceDateKey$ = new BehaviorSubject<string>(null);
  public startingBalanceMemoKey$ = new BehaviorSubject<string>(null);
  public balanceKey$ = new BehaviorSubject<string>(null);
  public paymentsCollection$ = new BehaviorSubject<string>(null);
  public chargesCollection$ = new BehaviorSubject<string>(null);
  public runningBalanceForCurrentCategory$ = new BehaviorSubject<number>(null);
  public transactions$ = new BehaviorSubject<any>(null);
  // set to false so that avatar spinner on category-select.component does not show initially
  public showAvatarSpinner$ = new BehaviorSubject<boolean>(false); 
  private transactions: any[] = [];

  constructor(private dataService: DataService) {
    console.log('TCL: FinancialsService -> constructor');
    this.categories = {
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }
    this.currentFinancialDoc = this.dataService.currentFinancialDoc
  }

  public setCategoryAndStrings(cat: any) {
    this.currentCategory$.next(cat); // entry.component listens for this.
    // Other components in this module such as history need some of these keys
    this.startingBalanceKey$.next(cat.key + 'StartingBalance');
    this.startingBalanceDateKey$.next(cat.key + 'StartingBalanceDate');
    this.startingBalanceMemoKey$.next(cat.key + 'StartingBalanceMemo');
    this.balanceKey$.next(cat.key + 'Balance');
    this.paymentsCollection$.next(cat.key + 'Payments');
    this.chargesCollection$.next(cat.key + 'Charges');

  }

  public getTransactions(collection) {
    const type = collection.includes('Payment') ? 'Payment' : 'Charge'
    this.currentFinancialDoc.collection(collection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            this.transactions.push({ id: item.id, amount: item.data().amount, type: type, date: date, memo: item.data().memo });
            this.transactions$.next(this.transactions);
          }
        )
      });
  }

  public clearTransactionsObservableAndArray() {
    this.transactions = [];
    this.transactions$.next(0);
    
  }
}
