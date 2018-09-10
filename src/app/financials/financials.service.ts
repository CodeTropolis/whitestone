import { Injectable } from '@angular/core';
import { DataService } from '../core/services/data.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FinancialsService {

  public categories: any;
  public currentCategory: any;
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
  public showAvatarSpinner$ = new BehaviorSubject<boolean>(false); // set to false so that avatar spinner on category-select.component does not show initially

  private transactions: any[] = [];
  private unique: any[] = [];
  private subscriptions: any[] = []

  constructor(private dataService: DataService) {

    this.categories = {
      tuition: 'Tuition',
      lunch: 'Lunch',
      extendedCare: 'Extended Care',
      misc: 'Misc',
    }
    
    this.subscriptions.push(
      this.currentCategory$.subscribe(cat => { // This gets set from category-select.component.
        if (cat == null) { return; }
       // console.log('TCL: FinancialsService -> constructor -> cat', cat);
        this.currentCategory = cat;
        // Set keys based on category selection and "next" them to an observable for other components to subscribe to i.e entry and history.
        this.startingBalanceKey$.next(this.currentCategory.key + 'StartingBalance');
        this.startingBalanceDateKey$.next(this.currentCategory.key + 'StartingBalanceDate');
        this.startingBalanceMemoKey$.next(this.currentCategory.key + 'StartingBalanceMemo');
        this.balanceKey$.next(this.currentCategory.key + 'Balance');
        this.paymentsCollection$.next(this.currentCategory.key + 'Payments');
        this.chargesCollection$.next(this.currentCategory.key + 'Charges');

        // Test
        // this.startingBalanceKey$.subscribe(x => console.log('TCL: FinancialsService -> startingBalanceKey -> x', x));
        // this.startingBalanceDateKey$.subscribe(x => console.log('TCL: FinancialsService -> startingBalanceDateKey -> x', x));
        // this.startingBalanceMemoKey$.subscribe(x => console.log('TCL: FinancialsService -> startingBalanceMemoKey -> x', x));
        // this.balanceKey$.subscribe(x => console.log('TCL: FinancialsService -> balanceKey -> x', x));
        // this.paymentsCollection$.subscribe(x => console.log('TCL: FinancialsService -> paymentsCollection -> x', x));
        // this.chargesCollection$.subscribe(x => console.log('TCL: FinancialsService -> paymentsCollection -> x', x));


      })
    );

    this.currentFinancialDoc = this.dataService.currentFinancialDoc
  }

  public getTransactions(collection) {
    this.currentFinancialDoc.collection(collection).ref.get()
      .then(snapshot => {
        snapshot.forEach(
          item => {
            let date = item.data().date.toDate();
            const type = collection.includes('Payment') ? 'Payment' : 'Charge'
            this.transactions.push({ id: item.id, amount: item.data().amount, type: type, date: date, memo: item.data().memo });
          }
        )
        // Filter out duplicates
       this.unique = this.transactions.filter((e, i) => {
          return this.transactions.findIndex((x) => {
            return x.id == e.id;
          }) == i;
        });
       console.log('TCL: FinancialsService -> publicgetTransactions -> unique', this.unique);
        this.transactions$.next(this.unique);
      });
  }

  public clearTransactions(){
    this.transactions = [];
    this.unique = [];
  }

  // ngOnDestroy() {
  //   this.subscriptions.forEach(sub => {
  //     sub.unsubscribe();
  //     console.log('TCL: FinancialsService -> ngOnDestroy -> sub', sub);
  //   });
  // }

}
