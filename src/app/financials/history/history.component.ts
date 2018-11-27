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
        // console.log("​HistoryComponent -> ngOnInit -> this.currentFinancialDoc id:", this.currentFinancialDoc.id);
        //console.log("​HistoryComponent -> ngOnInit -> this.currentFinancialDoc childFirstName:", this.currentFinancialDoc.data().childFirstName)
        
      }
    })
  );

    this.subscriptions.push(
      this.financialsService.currentCategory$.subscribe(cat => {
        if(cat){
          // this.runningBalanceKey = cat.key + 'RunningBalance';
					// console.log("​HistoryComponent -> ngOnInit ->  this.runningBalanceKey",  this.runningBalanceKey)
          this.chargesCollection = cat.key + 'Charges';
					//console.log("​HistoryComponent -> ngOnInit -> this.chargesCollection", this.chargesCollection)
          this.paymentsCollection = cat.key + 'Payments';
					//console.log("​HistoryComponent -> ngOnInit -> this.paymentsCollection", this.paymentsCollection)
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
