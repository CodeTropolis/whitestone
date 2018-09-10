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

  private subscriptions: any[] = [];
  private chargesCollection: string;
  private paymentsCollection: string;

  private currentFinancialDoc: any;
  private currentBalance: number;
  private updatedBalance: number;
  private balanceKey: string;

  public tableData: MatTableDataSource<any>;
  public tableColumns = ['amount', 'type', 'date', 'memo', 'delete'];
  public disableDelete: boolean[] = [];

  constructor(private dataService: DataService, private financialsService: FinancialsService) { }

  // init fires each time history component is shown on 
  // entry.component via: <app-history *ngIf="showHistory"></app-history>
  ngOnInit() {

    this.currentFinancialDoc = this.dataService.currentFinancialDoc;

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

    this.financialsService.clearTransactionsObservableAndArray(); // Clear out transactions from previously selected category i.e. prevent tuition payments/charges from showing in history for lunch
    this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
    this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);

    this.financialsService.transactions$.subscribe(x => {
      if (x) {
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
    if (this.updatedBalance) {
      // Are we dealing with the payments or charges subcollection?
      let collection: string;
      type === 'Payment' ? collection = this.paymentsCollection : collection = this.chargesCollection;
      this.currentFinancialDoc.collection(collection).doc(id).delete()
        .then(_ => {
          // Update the DB
          this.currentFinancialDoc.set({ [this.balanceKey]: this.updatedBalance }, { merge: true })
            .then(_ => { // update views
              this.financialsService.runningBalanceForCurrentCategory$.next(this.updatedBalance); // For entry.component to show Running Balance
              // Run through collection to update history table data.
              this.financialsService.clearTransactionsObservableAndArray();
              this.financialsService.getTransactions(this.currentFinancialDoc, this.paymentsCollection);
              this.financialsService.getTransactions(this.currentFinancialDoc, this.chargesCollection);
            })
        });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
