import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { DataService } from '../../core/services/data.service';
import { FinancialsService } from '../financials.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;

  private subscriptions: any[] = [];
  private chargesCollection: string;
  private paymentsCollection: string;

  private currentFinancialDoc: any;
  private currentBalance: number;
  private updatedBalance: number;
  private balanceKey: string;

  public tableData: MatTableDataSource<any>;
  public tableColumns;
  public disableDelete: boolean[] = [];

  public userIsAdmin: boolean = false;
  public userIsSubcriber: boolean = false;

  constructor(private authService: AuthService, private dataService: DataService, private financialsService: FinancialsService) { }

  ngOnInit() {

    console.log(`history init`);

    this.subscriptions.push(
      this.authService.userIsAdmin$.subscribe(x => {
       this.userIsAdmin = x;
     } )
   );

   this.subscriptions.push(
     this.authService.userIsSubcriber$.subscribe(x => {
       this.userIsSubcriber = x;
     })
   )

   if(this.userIsAdmin){
    this.tableColumns = ['amount', 'type', 'date', 'memo', 'delete'];
   }else{
    this.tableColumns = ['amount', 'type', 'date', 'memo'];
   }

    this.dataService.currentFinancialDoc$.subscribe(doc => {
      this.currentFinancialDoc = doc;
      this.setupHistory();
    });

  }

  private setupHistory(){
    console.log(`setupHistory`);
    this.subscriptions.push(
      this.financialsService.chargesCollection$.subscribe(collection => this.chargesCollection = collection)
    );
    this.subscriptions.push(
      this.financialsService.paymentsCollection$.subscribe(collection => this.paymentsCollection = collection)
    );
    this.subscriptions.push(
      this.financialsService.runningBalanceForCurrentCategory$.subscribe(bal => this.currentBalance = bal)
    );
    this.subscriptions.push(
      this.financialsService.balanceKey$.subscribe(key => this.balanceKey = key)
    );
    // Clear out transactions from previously selected category i.e. prevent tuition payments/charges from showing in history for lunch
    this.financialsService.clearTransactionsObservableAndArray();
    this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
    this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);

    this.financialsService.transactions$.subscribe(x => {
      if (x) {
        //console.log('TCL: HistoryComponent ->financialsService.transactions$.subscribe -> x', x); 
        this.tableData = new MatTableDataSource(x);
        this.tableData.sort = this.sort;
      } else {
        this.tableData = null; // Set tableData to null in order to meet conditional in history view: <mat-table *ngIf="tableData" [dataSource]="tableData" matSort>
      }
    });

  }

  deleteTransaction(id: string, type: string, amount: number) {
    this.disableDelete[id] = true; // Prevent user from entering delete multiple times for a row.

    type === 'Payment' ? this.updatedBalance = (this.currentBalance + amount) : this.updatedBalance = (this.currentBalance - amount);

    // Are we dealing with the payments or charges subcollection?
    let collection: string;
    type === 'Payment' ? collection = this.paymentsCollection : collection = this.chargesCollection;
    this.currentFinancialDoc.ref.collection(collection).doc(id).delete()
      .then(_ => {
        console.log('TCL: HistoryComponent -> deleteTransaction -> id', id, 'Amount:', amount);
        // Update the DB
        this.currentFinancialDoc.ref.set({ [this.balanceKey]: this.updatedBalance }, { merge: true })
          .then(_ => { // update views
            this.financialsService.runningBalanceForCurrentCategory$.next(this.updatedBalance); // For entry.component to show Running Balance
            // Run through collection to update history table data.
            this.financialsService.clearTransactionsObservableAndArray(); // This needs to happen prior to getTransactions - cannot place this functionality in getTransactions else only one collecton will be 'nexted' to the observable.
            this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);
            this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
          })
      });

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
