import { Component, OnInit } from '@angular/core';
import { FinancialsService } from '../financials.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  private subscriptions: any[] = [];
  public currentFinancialDoc: any;
  public currentCategory: string;
  public currentChild: string;
  //public runningBalanceKey: string;
  private chargesCollection: string;
  private paymentsCollection: string;
  public transactions$: BehaviorSubject<any[]>;

  constructor(private financialsService: FinancialsService) { }

  ngOnInit() {

    // currentFinancialDoc$ next'd by student-select.component
    this.subscriptions.push(
    this.financialsService.currentFinancialDoc$.subscribe(doc =>{ 
      if(doc){
        this.currentFinancialDoc = doc;
        this.currentChild = this.currentFinancialDoc.data().childFirstName + ' ' + this.currentFinancialDoc.data().childLastName;     
      }
    })
  );

    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        if(cat){
          this.currentCategory = cat.val;
          // this.runningBalanceKey = cat.key + 'RunningBalance';
          this.chargesCollection = cat.key + 'Charges';
          this.paymentsCollection = cat.key + 'Payments';
        }
      })
    );

    this.financialsService.transactions = [];
    this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
    this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);
    this.transactions$ = this.financialsService.transactions$;


  } // end init()

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
