import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;

  // private currentCategorySubscription: any;
  // private currentfinancialDocSubscription: any;
  // private runningBalanceSubscription: any;
  // private transactionSubscription: any;
  // private balanceKey: string;
  // private currentFinancialDoc: any;
  // private paymentsCollection: string;
  // private chargesCollection: string;
  // private currentBalance: number;
  // private updatedBalance: number;

  public tableData: MatTableDataSource<any>;
  public tableColumns = ['amount', 'type', 'date', 'memo', 'delete'];

  // public currentCatgory: any;
  public disableDelete: boolean[] = [];

  constructor(private dataService: DataService, private financialsService: FinancialsService) { }

  ngOnInit() {

    // this.currentCategorySubscription = this.financialsService.currentCategory$
    //   .subscribe(cat => {
    //     this.currentCatgory = cat;
    //     console.log('TCL: HistoryComponent -> ngOnInit -> this.currentCatgory', this.currentCatgory);
    //   });

    // this.currentfinancialDocSubscription = this.dataService.currentFinancialDoc$.subscribe(payload => this.currentFinancialDoc = payload);
    // this.runningBalanceSubscription = this.financialsService.runningBalanceForCurrentCategory$.subscribe(x => {
    //   this.currentBalance = x;
    //   // console.log('TCL: HistoryComponent -> ngOnInit -> currentBalance', this.currentBalance);
    // });

    // this.transactionSubscription = this.financialsService.transactions$.subscribe(x => {
    //   console.log('TCL: HistoryComponent -> transactionSubscription -> x', x);
    //   this.tableData = new MatTableDataSource(x);
    //   // this.ds.paginator = this.paginator;
    //   this.tableData.sort = this.sort;
    // });

    // this.balanceKey = this.currentCatgory.key + 'Balance';
    // this.paymentsCollection = this.currentCatgory.key + 'Payments';
    // this.chargesCollection = this.currentCatgory.key + 'Charges';

  }

  deleteTransaction(id: string, type: string, amount: number) {
    
    // this.disableDelete[id] = true; // Prevent user from entering delete multiple times for a row.
    // type === 'Payment' ? this.updatedBalance = (this.currentBalance + amount) : this.updatedBalance = (this.currentBalance - amount);

    // if (this.updatedBalance) {
    //   // Are we dealing with the payments or charges subcollection?
    //   let collection: string;
    //   type === 'Payment' ? collection = this.paymentsCollection : collection = this.chargesCollection;
    //   // Delete the transaction document from the respective collection
    //   this.currentFinancialDoc.collection(collection).doc(id).delete()
    //     .then(_ => {
    //       // Update the DB
    //       this.currentFinancialDoc.set({ [this.balanceKey]: this.updatedBalance }, { merge: true })
    //         .then(_ => { // update views
    //           this.financialsService.runningBalanceForCurrentCategory$.next(this.updatedBalance);
    //           // Run through collection to update history table data.
    //           this.financialsService.getTransactions(this.paymentsCollection);
    //           this.financialsService.getTransactions(this.chargesCollection);
    //         }) // Would work without placing in .then()
    //     });
    // }
  }

  ngOnDestroy() {
    // this.currentCategorySubscription.unsubscribe();
    // this.currentfinancialDocSubscription.unsubscribe();
    // this.runningBalanceSubscription.unsubscribe();
    // this.transactionSubscription.unsubscribe();

  }
}
